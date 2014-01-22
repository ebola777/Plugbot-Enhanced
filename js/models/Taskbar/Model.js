define('Plugbot/models/Taskbar/Model', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                windowTop: 0
            };
        }
    });

    return Model;
});
