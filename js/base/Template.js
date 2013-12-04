define('Plugbot/base/Template', [
    'handlebars'
], function (Handlebars) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Options
                 */
                // the actual view
                view: undefined,
                /**
                 * Runtime
                 */
                precompiledHbs: undefined,
                settingsElem: undefined
            };
        },
        initialize: function () {
            _.bindAll(this);
        },
        /**
         * Cache elements like this.$elA = this.$(this.elA)
         */
        cacheElements: function () {
            var key, elements = this.elements, view = this.options.view;

            for (key in elements) {
                if (elements.hasOwnProperty(key)) {
                    view['$' + key] = view.$(elements[key]);
                }
            }

            return this;
        },
        /**
         * Set element
         * @param {Object} settings     Settings
         */
        setSelf: function (settings) {
            this.options.view.setElement(this._getCompiledHbs(settings));

            return this;
        },
        /**
         * Set HTML
         * @param {Object} settings     Settings
         */
        setHtml: function (settings) {
            this.options.view.$el.html(this._getCompiledHbs(settings));

            return this;
        },
        /**
         * Get compiled handlebars html
         * @param {Object} settings     Settings
         * @return {string}     HTML
         * @private
         */
        _getCompiledHbs: function (settings) {
            var settingsElem;

            this._precompile();
            this._prepareSettings();

            settingsElem = _.clone(this.settingsElem);

            return this.precompiledHbs(
                _.defaults(settingsElem, settings)
            );
        },
        /**
         * Precompile handlebars template
         * @private
         */
        _precompile: function () {
            if (undefined === this.precompiledHbs) {
                this.precompiledHbs = Handlebars.compile(this.template);
            }
        },
        /**
         * Prepare settings and store to this.settingsElem
         * @private
         */
        _prepareSettings: function () {
            var key, elements, obj;

            if (undefined === this.settingsElem) {
                elements = this.elements;

                obj = {};

                for (key in elements) {
                    if (elements.hasOwnProperty(key)) {
                        obj[key] = elements[key];
                    }
                }

                this.settingsElem = obj;
            }
        }
    });

    return View;
});
