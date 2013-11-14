define('Plugbot/main/Settings', [
    'Plugbot/store/LocalStorage'
], function (LocalStorage) {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function initialize() {
        initSettings();
    }

    function saveSettingsDelay() {
        Plugbot.ticker.add(LocalStorage.saveSettings,
            {
                interval: Plugbot.tickerInterval.saveLocalStorage
            });
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    function initSettings() {
        /**
         * Ticker interval
         */
        Plugbot.tickerInterval = Plugbot.tickerInterval || {};

        _.defaults(Plugbot.tickerInterval, {
            defaults: 1000,
            APICallback: 3000,
            saveLocalStorage: 5000
        });
    }

    //endregion

    return {
        initialize: initialize,
        saveSettingsDelay: saveSettingsDelay
    };
});
