define('Plugbot/models/Userlist/UsersModel', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                users: undefined
            };
        },
        update: function () {
            this.set('users', API.getUsers());
        }
    });

    return Model;
});
