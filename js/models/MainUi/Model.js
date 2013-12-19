define('Plugbot/models/MainUi/Model', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                // item on/off
                autoWoot: undefined,
                autoJoin: undefined,
                skipVideo: undefined
            };
        },
        update: function () {
            var settings = Plugbot.settings.mainUi;

            this.set({
                autoWoot: settings.autoWoot,
                autoJoin: settings.autoJoin
            });
        }
    });

    return Model;
});
