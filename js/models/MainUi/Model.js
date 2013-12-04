define('Plugbot/models/MainUi/Model', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                data: [
                    {id: 'plugbot-btn-woot',
                        text: 'auto-woot',
                        enabled: Plugbot.settings.mainUi.autoWoot},
                    {id: 'plugbot-btn-join',
                        text: 'auto-join',
                        enabled: Plugbot.settings.mainUi.autoJoin},
                    {id: 'plugbot-btn-skip-video',
                        text: 'skip video',
                        enabled: false}
                ]
            };
        }
    });

    return Model;
});
