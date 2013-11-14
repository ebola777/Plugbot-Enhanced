define('Plugbot/models/Userlist/ItemModel', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                id: undefined,
                user: undefined
            };
        }
    });

    return Model;
});
