define('Plugbot/views/Userlist/HeadView', [
    'handlebars'
], function (Handlebars) {
    'use strict';

    var View = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this);
        },
        template: Handlebars.compile(
            '   <h1 class="userlist-queuespot">{{textQueueSpot}}<\/h1>'
        ),
        render: function () {
            var waitListPos = this.model.get('waitListPos');

            this.$el.html(this.template({
                textQueueSpot: 'Waitlist: ' +
                    (-1 === waitListPos ? '-' : waitListPos) + ' / ' +
                    this.model.get('waitListNum')
            }));

            return this;
        },
        close: function () {
            this.remove();
        }
    });

    return View;
});
