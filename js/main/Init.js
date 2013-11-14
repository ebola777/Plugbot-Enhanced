define('Plugbot/main/Init', [
    'Plugbot/main/WindowManager',
    'Plugbot/store/LocalStorage',
    'Plugbot/utils/Helpers',
    'Plugbot/utils/Ticker',
    'Plugbot/events/SiteEvents'
], function (WindowManager, LocalStorage, Helpers, Ticker, SiteEvents) {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function initialize() {
        /**
         * #1: Utilities
         */
            // read and apply settings
        LocalStorage.readSettings();

        // init handlebars helpers
        Helpers.initHandlebarsHelpers();

        // create a new ticker
        Plugbot.ticker = new Ticker({
            interval: Plugbot.tickerInterval.defaults
        });

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
        WindowManager.initPublicMethods();
    }

    //endregion

    return {
        initialize: initialize
    };
});
