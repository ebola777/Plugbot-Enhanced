define('Plugbot/views/layout/TableLayout', [
    'Plugbot/views/utils/UiHelpers'
], function (UiHelpers) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Options
                 */
                display: undefined,
                classes: [],
                values: [],
                styles: [],
                grows: []
            };
        },
        initialize: function () {
            _.bindAll(this);

            // pull options from defaults
            _.defaults(this.options, this.defaults);
        },
        elTableLayout: '.plugbot-table-layout',
        render: function () {
            // add class name
            this.$el.addClass(UiHelpers.getClass(this.elTableLayout));
            this.$el.children('div').addClass(this.options.display);

            this.resize();
        },
        resize: function () {
            var i,
                size = ('row' === this.options.display ?
                        'width' : 'height'),
                outerSize = ('row' === this.options.display ?
                        'outerWidth' : 'outerHeight'),
                elemWrap,
                value,
                style,
                grow,
                weight,
                total,
                arrRemain;

            total = this.$el[size]();
            arrRemain = [];
            weight = 0;
            for (i = 0; i !== this.options.classes.length; i += 1) {
                elemWrap = this.$('.' + this.options.classes[i]);
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

            if (0 !== weight) {
                total /= weight;
                for (i = 0; i !== arrRemain.length; i += 1) {
                    elemWrap =
                        this.$('.' + this.options.classes[arrRemain[i]]);
                    grow = this.options.grows[arrRemain[i]];

                    elemWrap.css(size, (total * grow) -
                        (elemWrap[outerSize](true) - elemWrap[size]()) +
                        'px');
                }
            }
        },
        close: function () {
        }
    });

    return View;
});
