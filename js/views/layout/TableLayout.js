define('Plugbot/views/layout/TableLayout', [
    'Plugbot/views/utils/UiHelpers'
], function (UiHelpers) {
    'use strict';

    var View = Backbone.View.extend({
        options: function () {
            return {
                display: undefined,
                classes: [],
                values: [],
                styles: [],
                grows: []
            };
        },
        initialize: function () {
            // runtime options
            this.clsTableLayout = '.plugbot-table-layout';
            this.cached = false;
            this.elCached = [];
        },
        render: function () {
            // add class name
            this.$el.addClass(UiHelpers.getClass(this.clsTableLayout));
            this.$el.children('div').addClass(this.options.display);

            this.resize();
        },
        resize: function () {
            var i,
                ind,
                size = ('row' === this.options.display ? 'width' : 'height'),
                outerSize = ('row' === this.options.display ? 'outerWidth' :
                        'outerHeight'),
                elemWrap,
                value,
                style,
                grow,
                weight,
                total,
                arrRemain;

            if (!this.cached) {
                this._cacheElements();
            }

            total = this.$el[size]();
            arrRemain = [];
            weight = 0;
            for (i = 0; i !== this.options.classes.length; i += 1) {
                elemWrap = this.elCached[i];
                value = this.options.values[i];
                style = this.options.styles[i];
                grow = this.options.grows[i];

                switch (style) {
                case 'auto':
                    elemWrap.css(size, 'auto');
                    total -= elemWrap[outerSize](true);
                    break;
                case 'px':
                    elemWrap.css(size, value + 'px');
                    total -= elemWrap[outerSize](true);
                    break;
                case '%':
                    elemWrap.css(size, value + '%');
                    total -= elemWrap[outerSize](true);
                    break;
                case '?':
                    elemWrap.css(size, 'auto');
                    weight += grow;
                    arrRemain.push(i);
                    break;
                }
            }

            // resize '?' style
            if (0 !== weight) {
                total /= weight;
                for (i = 0; i !== arrRemain.length; i += 1) {
                    ind = arrRemain[i];
                    elemWrap = this.elCached[ind];
                    grow = this.options.grows[ind];

                    elemWrap.css(size, (total * grow) -
                        (elemWrap[outerSize](true) - elemWrap[size]()) +
                        'px');
                }
            }
        },
        _cacheElements: function () {
            var i;

            for (i = 0; i !== this.options.classes.length; i += 1) {
                this.elCached[i] = this.$('.' + this.options.classes[i]);
            }

            this.cached = true;
        },
        close: function () {
            // not used
        }
    });

    return View;
});
