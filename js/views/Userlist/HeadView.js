define('Plugbot/views/Userlist/HeadView', [
    'Plugbot/tmpls/Userlist/HeadView'
], function (UserlistHeadViewTemplate) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Runtime
                 */
                template: undefined
            };
        },
        TEMPLATE: UserlistHeadViewTemplate,
        initialize: function () {
            _.bindAll(this);
            _.defaults(this, this.defaults());

            // init template
            this.options.template = new this.TEMPLATE({view: this});
        },
        render: function () {
            var waitListPos = this.model.get('waitListPos');

            this.options.template.setHtml({
                textWaitListPos: 'Waitlist: ' +
                    (-1 === waitListPos ? '-' : waitListPos + 1) + ' / ' +
                    this.model.get('waitListNum')
            });

            return this;
        },
        close: function () {
            this.remove();
        }
    });

    return View;
});
