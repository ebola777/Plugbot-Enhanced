define('Plugbot/main/Settings', [
    'Plugbot/store/LocalStorage',
    'Plugbot/utils/Helpers',
    'Plugbot/views/utils/Ui',
    'Plugbot/views/utils/UiHelpers'
], function (LocalStorage, Helpers, Ui, UiHelpers) {
    'use strict';

    //region VARIABLES =====
        // min compatible version, empty: not compatible with any older version
    var minCompatibleVersion = '1.0.3.pre',
        // read-only settings
        settingsReadOnly = {
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
        },
        // default settings
        settingsDefault = {
            version: '1.0.4.pre',
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
            ui: {
                autoWoot: true,
                autoQueue: false
            }
        };

    //endregion


    //region PUBLIC FUNCTIONS =====
    function initialize() {
        Plugbot.settings = Plugbot.settings || {};

        initTickerInterval();
    }

    /**
     * Read settings
     * user -> default -> read-only
     */
    function readSettings() {
        var settingsUser = LocalStorage.readSettings(),
            currentVersion = settingsDefault.version,
            fnGetExtendDefault = function (settings) {
                var obj = _.clone(settingsReadOnly);

                Helpers.extendDeep(settings, obj);

                return obj;
            },
            fnExtendSettings = function () {
                var obj = _.clone(settingsDefault);

                Helpers.applyDeep(settingsUser, obj);
                Plugbot.settings = fnGetExtendDefault(obj);
            },
            fnUseDefault = function () {
                Plugbot.settings = fnGetExtendDefault(settingsDefault);
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
    function saveSettings() {
        var obj = _.clone(settingsDefault);

        // use ticker to delay action
        Plugbot.ticker.add(function () {
            Helpers.applyDeep(Plugbot.settings, obj);
            LocalStorage.saveSettings(obj);
        }, {
            interval: Plugbot.tickerInterval.saveSettings
        });
    }

    function clearSettings() {
        LocalStorage.clearSettings();
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    function initTickerInterval() {
        Plugbot.tickerInterval = Plugbot.tickerInterval || {};

        _.defaults(Plugbot.tickerInterval, {
            defaults: 1000,
            APICallback: 3000,
            saveSettings: 5000
        });
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
