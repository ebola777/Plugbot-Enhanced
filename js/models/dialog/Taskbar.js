define('Plugbot/models/dialog/Taskbar', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                windows: undefined,
                windowTop: 0
            };
        }
    });

    return Model;
});
