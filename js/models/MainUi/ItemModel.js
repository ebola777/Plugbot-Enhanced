define('Plugbot/models/MainUi/ItemModel', [
    'Plugbot/main/Settings'
], function (Settings) {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                id: undefined,
                text: undefined,
                enabled: false
            };
        },
        initialize: function () {
            _.bindAll(this);

            this.listenTo(this, 'change:enabled', this.setSettings);
        },
        setSettings: function () {
            var en = this.get('enabled');

            switch (this.get('id')) {
            case 'plugbot-btn-woot':
                Plugbot.settings.mainUi.autoWoot = en;
                break;
            case 'plugbot-btn-join':
                Plugbot.settings.mainUi.autoJoin = en;
                break;
            }

            Settings.saveSettings();
        }
    });

    return Model;
});
