define('Plugbot/models/Taskbar/ItemModel', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                name: undefined,
                title: 'Unnamed',
                window: undefined
            };
        }
    });

    return Model;
});
