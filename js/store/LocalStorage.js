define('Plugbot/store/LocalStorage', [
    'Plugbot/store/LZString'
], function (LZString) {
    'use strict';

    //region VARIABLES =====
        // local storage root name
    var rootName = 'PlugbotEnhanced';

    //endregion


    //region PUBLIC FUNCTIONS =====
    /**
     * Read settings
     * @return {Object}     Settings
     */
    function readSettings() {
        var settings = {},
            compressed,
            decompressed;

        // get settings from local storage
        try {
            compressed = localStorage.getItem(rootName);
            decompressed = LZString.decompressFromUTF16(compressed) || '{}';
            settings = JSON.parse(decompressed);
        } catch (ex) {
            settings = {};
        }

        return settings;
    }

    /**
     * Save settings
     * @param {Object} settings     Settings
     */
    function saveSettings(settings) {
        var compressed =
            _.compose(LZString.compressToUTF16, JSON.stringify)(settings);

        localStorage.setItem(rootName, compressed);
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
