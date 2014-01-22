define('Plugbot/main/Settings', [
    'Plugbot/store/LocalStorage',
    'Plugbot/utils/Helpers',
    'Plugbot/views/FloatedWindow/View',
    'Plugbot/views/utils/Ui',
    'Plugbot/views/utils/UiHelpers'
], function (LocalStorage, Helpers, FloatedWindowView, Ui, UiHelpers) {
    'use strict';

    //region VARIABLES =====
        // version delimiter
    var delimVersion = '.',
        // min compatible version
        minCompatibleVersion = '1.0.5.pre',
        // current version
        currentVersion = '1.0.13.pre',
        // throttled version of saving settings function
        throttledSaveSettings,
        // interval of saving settings
        throttleSaveSettingsInterval = 3000,
        // is last saving immediate
        lastSaveImmediate,
        // read-only settings
        settingsReadOnly = function () {
            return {
                tickerInterval: {
                    defaults: 1000,
                    APICallback: 1000
                },
                windows: {
                    MainUi: {
                        name: 'MainUi',
                        bodyClass: UiHelpers.getClass(Ui.plugbot.mainUi),
                        view: 'Plugbot/views/MainUi/View',
                        narrowAction: FloatedWindowView.prototype
                            .NARROW_ACTIONS.NONE,
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
                        narrowAction: FloatedWindowView.prototype
                            .NARROW_ACTIONS.CALLSIGN,
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
        // default settings, will be stored at client-side
        settingsDefault = function () {
            return {
                // current version
                version: currentVersion,
                windows: {
                    MainUi: {
                        status: FloatedWindowView.prototype.STATUS.NORMAL,
                        x: 70,
                        y: 85,
                        width: 'auto',
                        height: 'auto',
                        settings: {
                            autoWoot: true,
                            autoJoin: false
                        }
                    },
                    Userlist: {
                        status: FloatedWindowView.prototype.STATUS.MINIMIZED,
                        x: 730,
                        y: 70,
                        width: 8 * 30,
                        height: 8 * 50
                    }
                }
            };
        };

    //endregion


    //region PUBLIC FUNCTIONS =====
    function initialize() {
        Plugbot.settings = Plugbot.settings || {};

        // version info
        Plugbot.VERSION = currentVersion;

        // throttle: save settings
        throttledSaveSettings = _.throttle(_saveSettingsImmediate,
            throttleSaveSettingsInterval);
    }

    /**
     * Read settings
     * user -> default -> read-only
     */
    function readSettings() {
        var settingsDefaultCloned = settingsDefault(),
            settingsUser = LocalStorage.readSettings(),
            cmpVer = _compareVersion(currentVersion, settingsUser.version,
                delimVersion),
            cmpCompatibleVer = _compareVersion(settingsUser.version,
                minCompatibleVersion, delimVersion),
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
            },
            fnUpdateVersion = function () {
                // override version
                Plugbot.settings.version = currentVersion;
            };

        // check version
        if (undefined !== settingsUser.version) {
            /**
             * User has used it before
             */

            if (0 === cmpVer) {
                /**
                 * Same version
                 */
                fnExtendSettings();
            } else if (1 === cmpVer) {
                /**
                 * Current version is newer
                 */
                if (1 === cmpCompatibleVer) {
                    /**
                     * Compatible with older version
                     */
                    fnExtendSettings();
                    fnUpdateVersion();
                } else {
                    /**
                     * Incompatible with older version
                     */
                    fnUseDefault();
                }
            } else {
                /**
                 * Current version is older
                 */
                fnUseDefault();
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

        // when set to true, past throttled call will be canceled
        lastSaveImmediate = options.immediate;

        if (options.immediate) {
            _saveSettingsImmediate(true);
        } else {
            throttledSaveSettings();
        }
    }

    function clearSettings() {
        LocalStorage.clearSettings();
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    function _saveSettingsImmediate(force) {
        var obj;

        // only run when immediate flag is true or force is true
        if (!lastSaveImmediate || force) {
            obj = settingsDefault();

            Helpers.applyDeep(Plugbot.settings, obj);
            LocalStorage.saveSettings(obj);
        }
    }

    /**
     * Compare two versions
     * @param {string} first    First version
     * @param {string} second   Second version
     * @param {string} delim    Delimeter
     * @return {number} 0: equal, 1: 1st > 2nd, -1: 1st < 2nd, null: error
     * @private
     */
    function _compareVersion(first, second, delim) {
        var ret = 0,
            i,
            arrFirst,
            arrSecond,
            partFirst,
            partSecond,
            fnToNum = function (str) {
                var ret = str;

                if (_.isFinite(str)) {
                    ret = +str;
                }

                return ret;
            };

        if (undefined === first || undefined === second) {
            ret = null;
        } else {
            arrFirst = first.split(delim);
            arrSecond = second.split(delim);

            for (i = 0; i !== arrFirst.length &&
                    i !== arrSecond.length; i += 1) {
                partFirst = fnToNum(arrFirst[i]);
                partSecond = fnToNum(arrSecond[i]);

                if (partFirst > partSecond) {
                    ret = 1;
                    break;
                } else if (partFirst < partSecond) {
                    ret = -1;
                    break;
                }
            }

            if (arrFirst.length !== arrSecond.length) {
                ret = (arrFirst > arrSecond ? 1 : -1);
            }
        }

        return ret;
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
