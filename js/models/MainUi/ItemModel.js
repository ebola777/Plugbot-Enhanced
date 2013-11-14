define('Plugbot/models/MainUi/ItemModel', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                id: undefined,
                text: undefined,
                enabled: false,
                settingsObj: undefined,
                settingsKey: undefined
            };
        },
        initialize: function () {
            _.bindAll(this);

            this.listenTo(this, 'change:enabled', this.setSettings);
        },
        setSettings: function () {
            var settingsObj = this.get('settingsObj');

            if (undefined !== settingsObj) {
                settingsObj[this.get('settingsKey')] = this.get('enabled');
            }
        }
    });

    return Model;
});
