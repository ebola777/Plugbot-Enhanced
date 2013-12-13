/**
 * This class tracks sub-views, renders or closes them as needed.
 * A class inherited from this class can have one parent and multiple
 * sub-views.
 */

define('Plugbot/base/SubView', [], function () {
    'use strict';

    var View = Backbone.View.extend({
        initialize: function () {
            // runtime options
            this._objSubViews = {};
        },
        renderSub: function (idSub, options) {
            var key, subViews;

            if (null === idSub || undefined === idSub) {
                subViews = this._objSubViews;

                for (key in subViews) {
                    if (subViews.hasOwnProperty(key)) {
                        subViews[key].renderFromParent(options);
                    }
                }
            } else {
                this._objSubViews[idSub].renderFromParent(options);
            }

            return this;
        },
        /**
         * Get or set all sub-views
         * @param {Object.<{name: string}, {view}>=} subViews   Sub-views
         * @param {Object=} options     Options set to sub-views
         */
        subViews: function (subViews, options) {
            var ret;

            if (undefined === subViews) {
                ret = this._getSubViews();
            } else {
                this._setSubViews(subViews, options);
                ret = this;
            }

            return ret;
        },
        setSubView: function (id, view) {
            this._objSubViews[id] = view;
        },
        getSubView: function (id) {
            return this._objSubViews[id];
        },
        closeSubView: function (id) {
            this._objSubViews[id].close();
            delete this._objSubViews[id];
        },
        closeAllSubViews: function () {
            var key,
                subViews = this._objSubViews;

            for (key in subViews) {
                if (subViews.hasOwnProperty(key)) {
                    subViews[key].close();
                }
            }

            this._objSubViews = {};
        },
        _getSubViews: function () {
            return this._objSubViews;
        },
        _setSubViews: function (subViews, options) {
            var key,
                subView;
            this._objSubViews = subViews;

            for (key in subViews) {
                if (subViews.hasOwnProperty(key)) {
                    subView = subViews[key];

                    // parent options
                    subView.options.optionsParent = options;
                }
            }
        }
    });

    return View;
});
