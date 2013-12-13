define('Plugbot/models/Userlist/HeadModel', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                waitListPos: undefined,
                waitListNum: undefined
            };
        },
        update: function () {
            this.set('waitListPos', API.getWaitListPosition());
            this.set('waitListNum', API.getWaitList().length);
        }
    });

    return Model;
});
