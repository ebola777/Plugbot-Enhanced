define('Plugbot/views/Userlist/HeadView', [
    'Plugbot/models/Userlist/HeadModel',
    'Plugbot/tmpls/Userlist/HeadView'
], function (UserlistHeadModel, UserlistHeadTemplate) {
    'use strict';

    var View = Backbone.View.extend({
        initialize: function () {
            // set model
            this.model = new UserlistHeadModel();

            // runtime options
            this.template = new UserlistHeadTemplate({view: this});

            // model events
            this.listenTo(this.model, 'change', this.render);
        },
        renderFromParent: function () {
            this.model.update();
        },
        render: function () {
            var waitListPos = this.model.get('waitListPos');

            this.template.setHtml({
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
