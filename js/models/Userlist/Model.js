define('Plugbot/models/Userlist/Model', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                numUsers: undefined,
                waitListPos: undefined,
                users: undefined
            };
        },
        updateAll: function () {
            this.updateUsers();
            this.updateWaitList();
        },
        updateUsers: function () {
            this.set('users', API.getUsers());
        },
        updateWaitList: function () {
            this.set('waitListPos', API.getWaitListPosition());
            this.set('waitListNum', API.getWaitList().length);

        }
    });

    return Model;
});
