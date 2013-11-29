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

        // create a new public ticker
        Plugbot.ticker = new Ticker();

        // create a new public watcher
        Plugbot.watcher = new Watcher();

        /**
         * #2: Events
         */
        // init dispatcher
        SiteEvents.initDispatcher();

        /**
         * #3: UIs
         */
        // init UIs
        initUis();

        // notify that PlugBot has been initialized
        Plugbot.initDone();
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    /**
     * Init UIs
     */
    function initUis() {
        WindowManager.initTaskbar();
        WindowManager.initWindows();
        WindowManager.initEvents();
        WindowManager.initPublicMethods();
    }

    //endregion

    return {
        initialize: initialize
    };
});
