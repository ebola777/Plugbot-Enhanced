define('Plugbot/main/Init', [
    'Plugbot/events/SiteEvents',
    'Plugbot/main/Settings',
    'Plugbot/main/WindowManager',
    'Plugbot/utils/Helpers',
    'Plugbot/utils/Ticker',
    'Plugbot/utils/Watcher'
], function (SiteEvents, Settings, WindowManager, Helpers, Ticker, Watcher) {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function initialize() {
        /**
         * #1: Utilities
         */
        // read settings
        Settings.readSettings();

        // init handlebars helpers
        Helpers.initHandlebarsHelpers();

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
            defaultOptions: {
                exitValue: true,
                exitCall: callback
            }
        });

        watcher
            .addFn(function () {
                return API.enabled;
            })
            .invoke();
    }

    function initWatchers() {
        Plugbot.watcher = new Watcher();
    }

    function initTickers() {
        // the 'keyId' must be in Plugbot.settings.tickerIds list in case of
        //      typo
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
                        throw 'ticker key ' + keyId + ' not found';
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
