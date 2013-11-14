define('Plugbot/models/MainUi/Model', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                data: [
                    {id: 'plugbot-btn-woot',
                        text: 'auto-woot',
                        enabled: Plugbot.settings.ui.autoWoot,
                        settingsObj: Plugbot.settings.ui,
                        settingsKey: 'autoWoot'},
                    {id: 'plugbot-btn-queue',
                        text: 'auto-queue',
                        enabled: Plugbot.settings.ui.autoQueue,
                        settingsObj: Plugbot.settings.ui,
                        settingsKey: 'autoQueue'},
                    {id: 'plugbot-btn-skip-video',
                        text: 'skip video',
                        enabled: false}
                ]
            };
        }
    });

    return Model;
});
