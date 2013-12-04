define('Plugbot/models/Taskbar/Model', [], function () {
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
