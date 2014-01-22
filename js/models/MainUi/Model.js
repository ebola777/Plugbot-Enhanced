define('Plugbot/models/MainUi/Model', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                // item on/off
                autoWoot: false,
                autoJoin: false,
                skipVideo: false
            };
        }
    });

    return Model;
});
