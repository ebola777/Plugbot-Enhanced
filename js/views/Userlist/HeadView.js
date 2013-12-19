define('Plugbot/views/Userlist/HeadView', [
    'Plugbot/models/Userlist/HeadModel',
    'Plugbot/tmpls/Userlist/HeadView'
], function (HeadModel, HeadTemplate) {
    'use strict';

    var View = Backbone.View.extend({
        initialize: function () {
            // set model
            this.model = new HeadModel();

            // runtime options
            this.template = new HeadTemplate({view: this});

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
