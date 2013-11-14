define('Plugbot/store/LocalStorage', [
    'Plugbot/views/Ui',
    'Plugbot/views/utils/UiHelpers'
], function (Ui, UiHelpers) {
    'use strict';

    //region VARIABLES =====
        // local storage root name
    var rootName = 'PlugbotEnhanced',
        // default settings
        defaultSettings = {
            version: '1.0.1pa',
            // override old settings if it's different version
            overrideOldSettings: true,
            windows: {
                MainUi: {
                    name: 'MainUi',
                    bodyClass: UiHelpers.getClass(Ui.plugbot.mainUi),
                    status: 'normal',
                    view: 'Plugbot/views/MainUi/View',
                    narrowAction: 'none',
                    title: 'Plugbot',
                    callsign: 'PB',
                    zIndex: 22,
                    oldZIndex: 22,
                    resizable: false,
                    draggable: true,
                    x: 70,
                    y: 85,
                    oldX: 70,
                    oldY: 85,
                    width: 'auto',
                    height: 'auto'
                },
                Userlist: {
                    name: 'Userlist',
                    bodyClass: UiHelpers.getClass(Ui.plugbot.userlist),
                    status: 'minimized',
                    view: 'Plugbot/views/Userlist/View',
                    narrowAction: 'callsign',
                    title: 'Userlist',
                    callsign: 'UL',
                    zIndex: 21,
                    oldZIndex: 21,
                    resizable: true,
                    draggable: true,
                    x: 730,
                    y: 70,
                    oldX: 730,
                    oldY: 70,
                    width: 8 * 30,
                    height: 8 * 50,
                    minWidth: 8 * 15,
                    maxWidth: 8 * 40,
                    minHeight: 0,
                    maxHeight: 8 * 90
                }
            },
            ui: {
                autoWoot: true,
                autoQueue: false,
                hideVideo: false
            }
        };

    //endregion


    //region CONSTRUCTORS =====
    (function () {
        Plugbot.settings = Plugbot.settings || {};
    }());

    //endregion


    //region PUBLIC FUNCTIONS =====
    function readSettings() {
        // get settings from local storage
        try {
            Plugbot.settings =
                JSON.parse(localStorage.getItem(rootName)) || {};
        } catch (ex) {
            Plugbot.settings = {};
        }

        // check version
        if (Plugbot.settings.version !== defaultSettings.version) {
            if (defaultSettings.overrideOldSettings) {
                Plugbot.settings = {};
            } else {
                Plugbot.settings.version = defaultSettings.version;
            }
        }

        // override settings if they are not set
        _.defaults(Plugbot.settings, defaultSettings);
    }

    /**
     * Save settings
     */
    function saveSettings() {
        if (undefined !== Plugbot) {
            localStorage.setItem(rootName, JSON.stringify(Plugbot.settings));
        }
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
