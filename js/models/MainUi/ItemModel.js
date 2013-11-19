define('Plugbot/models/MainUi/ItemModel', [], function () {
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
                Plugbot.settings.ui.autoWoot = en;
                break;
            case 'plugbot-btn-queue':
                Plugbot.settings.ui.autoQueue = en;
                break;
            }
        }
    });

    return Model;
});
