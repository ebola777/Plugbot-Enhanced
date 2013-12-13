define('Plugbot/main/Init', [
    'Plugbot/events/site/Events',
    'Plugbot/main/Settings',
    'Plugbot/main/WindowManager',
    'Plugbot/utils/Ticker',
    'Plugbot/utils/Watcher'
], function (SiteEvents, Settings, WindowManager, Ticker, Watcher) {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function initialize() {
        /**
         * #1: Utilities
         */
        // read settings
        Settings.readSettings();

        // init watchers and tickers
        initWatchers();
        initTickers();

        /**
         * #2: Events
         */
        // init site dispatcher
        SiteEvents.initDispatcher();

        /**
         * #3: UIs
         */
        // init UIs
        initUis();

        /**
         * #4: Notification
         */
        // notify that PlugBot has been initialized
        Plugbot.initDone();
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    /**
     * Init UIs
     */
    function initUis() {
        waitAPIEnabled(function () {
            WindowManager.initTaskbar();
            WindowManager.initWindows();
            WindowManager.initEvents();
            WindowManager.initPublicMethods();
        });
    }

    /**
     * Wait API till it's enabled
     * @param {function} callback   Callback when done
     */
    function waitAPIEnabled(callback) {
        var watcher = new Watcher({
            interval: '1 hz',
            exitWhenNoCall: true,
            exitValue: true,
            exitCall: callback
        });

        watcher
            .addFn(function () {
                return API.enabled;
            })
            .invoke();
    }

    function initWatchers() {
        // the 'keyId' must be in Plugbot.settings.watcherIds list
        Plugbot.watcher = (function () {
            return {
                _watcher: new Watcher(),
                add: function (keyId, fn, options) {
                    var id = this.getId(keyId);

                    this._watcher.add(id, fn, options);
                },
                remove: function (keyId) {
                    var id = this.getId(keyId);

                    this._watcher.remove(id);
                },
                clear: function () {
                    this._watcher.clear();
                },
                getId: function (keyId) {
                    var ret,
                        id = Plugbot.settings.watcherIds[keyId];

                    if (undefined !== id) {
                        ret = id;
                    } else {
                        throw new Error('watcher key ' + keyId + ' not found');
                    }

                    return ret;
                },
                close: function () {
                    this._watcher.close();
                }
            };
        }());
    }

    function initTickers() {
        // the 'keyId' must be in Plugbot.settings.tickerIds list
        Plugbot.ticker = (function () {
            return {
                _ticker: new Ticker(),
                add: function (keyId, fn, options) {
                    var id = this.getId(keyId);

                    this._ticker.add(id, fn, options);
                },
                remove: function (keyId) {
                    var id = this.getId(keyId);

                    this._ticker.remove(id);
                },
                clear: function () {
                    this._ticker.clear();
                },
                getId: function (keyId) {
                    var ret,
                        id = Plugbot.settings.tickerIds[keyId];

                    if (undefined !== id) {
                        ret = id;
                    } else {
                        throw new Error('ticker key ' + keyId + ' not found');
                    }

                    return ret;
                },
                close: function () {
                    this._ticker.close();
                }
            };
        }());
    }

    //endregion

    return {
        initialize: initialize
    };
});
