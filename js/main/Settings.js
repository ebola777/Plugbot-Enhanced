define('Plugbot/main/Settings', [
    'Plugbot/store/LocalStorage',
    'Plugbot/utils/Helpers',
    'Plugbot/views/utils/Ui',
    'Plugbot/views/utils/UiHelpers'
], function (LocalStorage, Helpers, Ui, UiHelpers) {
    'use strict';

    //region VARIABLES =====
        // min compatible version, empty: not compatible with any older version
    var minCompatibleVersion = '1.0.5.pre',
        // read-only settings
        settingsReadOnly = function () {
            return {
                tickerIds: {
                    saveSettings: 'save-settings',
                    saveWindow: 'save-window'
                },
                watcherIds: {
                    playlistVisible: 'playlist-visible'
                },
                tickerInterval: {
                    defaults: 1000,
                    APICallback: 3000,
                    saveSettings: 5000
                },
                windows: {
                    MainUi: {
                        name: 'MainUi',
                        bodyClass: UiHelpers.getClass(Ui.plugbot.mainUi),
                        view: 'Plugbot/views/MainUi/View',
                        narrowAction: 'none',
                        title: 'Plugbot',
                        callsign: 'PB',
                        zIndex: 22,
                        resizable: false,
                        draggable: true
                    },
                    Userlist: {
                        name: 'Userlist',
                        bodyClass: UiHelpers.getClass(Ui.plugbot.userlist),
                        view: 'Plugbot/views/Userlist/View',
                        narrowAction: 'callsign',
                        title: 'Userlist',
                        callsign: 'UL',
                        zIndex: 21,
                        resizable: true,
                        draggable: true,
                        minWidth: 8 * 15,
                        maxWidth: 8 * 40,
                        minHeight: 0,
                        maxHeight: 8 * 90
                    }
                }
            };
        },
        // default settings
        settingsDefault = function () {
            return {
                version: '1.0.10.pre',
                windows: {
                    MainUi: {
                        status: 'normal',
                        oldZIndex: 22,
                        x: 70,
                        y: 85,
                        oldX: 70,
                        oldY: 85,
                        width: 'auto',
                        height: 'auto'
                    },
                    Userlist: {
                        status: 'minimized',
                        oldZIndex: 21,
                        x: 730,
                        y: 70,
                        oldX: 730,
                        oldY: 70,
                        width: 8 * 30,
                        height: 8 * 50
                    }
                },
                mainUi: {
                    autoWoot: true,
                    autoJoin: false
                }
            };
        };

    //endregion


    //region PUBLIC FUNCTIONS =====
    function initialize() {
        Plugbot.settings = Plugbot.settings || {};
    }

    /**
     * Read settings
     * user -> default -> read-only
     */
    function readSettings() {
        var settingsDefaultCloned = settingsDefault(),
            settingsUser = LocalStorage.readSettings(),
            currentVersion = settingsDefaultCloned.version,
            fnGetExtendDefault = function (settings) {
                var obj = settingsReadOnly();

                Helpers.extendDeep(settings, obj);

                return obj;
            },
            fnExtendSettings = function () {
                var obj = settingsDefault();

                Helpers.applyDeep(settingsUser, obj);
                Plugbot.settings = fnGetExtendDefault(obj);
            },
            fnUseDefault = function () {
                Plugbot.settings = fnGetExtendDefault(settingsDefaultCloned);
            };

        // check version
        if (undefined !== settingsUser.version) {
            if (currentVersion === settingsUser.version) {
                /**
                 * Same version
                 */
                fnExtendSettings();
            } else {
                /**
                 * Older version
                 */
                if ('' !== minCompatibleVersion &&
                        settingsUser.version >= minCompatibleVersion) {
                    /**
                     * Compatible version
                     */
                    fnExtendSettings();
                    // override version
                    Plugbot.settings.version = currentVersion;
                } else {
                    /**
                     * Incompatible version
                     */
                    fnUseDefault();
                }
            }
        } else {
            /**
             * First seen
             */
            fnUseDefault();
        }
    }

    /**
     * Save settings
     */
    function saveSettings(options) {
        options = options || {};
        _.defaults(options, {
            immediate: false
        });

        if (options.immediate) {
            saveSettingsImmediate();
        } else {
            // use ticker to delay action
            Plugbot.ticker.add('saveSettings', function () {
                saveSettingsImmediate();
            }, {
                interval: Plugbot.settings.tickerInterval.saveSettings
            });
        }
    }

    function clearSettings() {
        LocalStorage.clearSettings();
    }

    //endregion


    //region PRIVATE FUNCTIONS
    function saveSettingsImmediate() {
        var obj = settingsDefault();

        Helpers.applyDeep(Plugbot.settings, obj);
        LocalStorage.saveSettings(obj);
    }

    //endregion

    return {
        // functions
        initialize: initialize,
        readSettings: readSettings,
        saveSettings: saveSettings,
        clearSettings: clearSettings
    };
});
