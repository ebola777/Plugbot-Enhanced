define('Plugbot/models/MainUi/Model', [
    'Plugbot/main/Settings'
], function (Settings) {
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
        initialize: function () {
            this.listenTo(this, 'change', this.onChangeAny);
        },
        update: function () {
            var settings = Plugbot.settings.mainUi;

            this.set({
                autoWoot: settings.autoWoot,
                autoJoin: settings.autoJoin
            });
        },
        onChangeAny: function (e) {
            var key, value, changed = e.changedAttributes();

            for (key in changed) {
                if (changed.hasOwnProperty(key)) {
                    value = changed[key];

                    switch (key) {
                    case 'autoWoot':
                        Plugbot.settings.mainUi.autoWoot = value;
                        break;
                    case 'autoJoin':
                        Plugbot.settings.mainUi.autoJoin = value;
                        break;
                    }
                }
            }

            this._saveSettings();
        },
        _saveSettings: function () {
            Settings.saveSettings();
        }
    });

    return Model;
});
