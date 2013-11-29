define('Plugbot/store/LocalStorage', [], function () {
    'use strict';

    //region VARIABLES =====
        // local storage root name
    var rootName = 'PlugbotEnhanced';

    //endregion


    //region PUBLIC FUNCTIONS =====
    function readSettings() {
        var settings = {};

        // get settings from local storage
        try {
            settings = JSON.parse(localStorage.getItem(rootName)) || {};
        } catch (ex) {
            settings = {};
        }

        return settings;
    }

    /**
     * Save settings
     */
    function saveSettings(settings) {
        localStorage.setItem(rootName, JSON.stringify(settings));
    }

    /**
     * Clear settings
     */
    function clearSettings() {
        localStorage.removeItem(rootName);
    }

    //endregion

    return {
        readSettings: readSettings,
        saveSettings: saveSettings,
        clearSettings: clearSettings
    };
});
