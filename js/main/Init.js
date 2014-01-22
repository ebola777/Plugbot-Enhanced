define('Plugbot/main/Init', [
    'Plugbot/events/site/Events',
    'Plugbot/main/mgrs/SiteManager',
    'Plugbot/main/mgrs/TaskbarManager',
    'Plugbot/main/mgrs/WindowManager',
    'Plugbot/main/mgrs/ResourceManager',
    'Plugbot/main/Settings',
    'Plugbot/utils/APIBuffer',
    'Plugbot/utils/Watcher'
], function (SiteEvents, SiteManager, TaskbarManager, WindowManager,
             ResourceManager, Settings, APIBuffer, Watcher) {
    'use strict';

    //region VARIABLES =====
    var listener = _.clone(Backbone.Events);

    //endregion


    //region PUBLIC FUNCTIONS =====
    function initialize() {
        /**
         * #1: Utilities
         */
        // read settings
        Settings.readSettings();

        /**
         * #2: Events
         */
        // init site dispatcher
        SiteEvents.initDispatcher();

        /**
         * #3: Resources
         */
        // init resources
        _initResources();

        /**
         * #4: Notification
         */
        // notify that Plugbot has been initialized
        Plugbot.initDone();
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    /**
     * Init resources
     */
    function _initResources() {
        var bufferAPI, siteManager, windowManager, taskbarManager;

        /**
         * Utilities
         */
        bufferAPI = new APIBuffer({
            tickerInterval: Plugbot.settings.tickerInterval.APICallback
        });
        ResourceManager.set('API-buffer', bufferAPI);

        /**
         * UI
         */
        _waitAPIEnabled(function () {
            /**
             * #1: Init managers
             */
            siteManager = new SiteManager();

            windowManager = new WindowManager({
                windowSettings: Plugbot.settings.windows
            });

            taskbarManager = new TaskbarManager();

            /**
             * #2: Listen to managers
             */
            _listenToWindowManager(windowManager);

            /**
             * #3: Set resources
             */
            ResourceManager.set({
                'site-manager': siteManager,
                'window-manager': windowManager,
                'taskbar-manager': taskbarManager
            });

            /**
             * #4: Render managers
             */
            siteManager.render();
            windowManager.render();
            taskbarManager.render();

            /**
             * #4: Expose managers
             */
            Plugbot.siteManager = siteManager;
            Plugbot.windowManager = windowManager;
            Plugbot.taskbarManager = taskbarManager;
        });
    }

    /**
     * Wait API till it's enabled
     * @param {function} callback   Callback when done
     */
    function _waitAPIEnabled(callback) {
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

    function _listenToWindowManager(windowManager) {
        var disprWndMgr = windowManager.dispatcher;

        listener.listenTo(disprWndMgr, disprWndMgr.CHANGE_SETTINGS,
            function (options) {
                Plugbot.settings.windows = options.windowSettings;

                Settings.saveSettings();
            });
    }

    //endregion

    return {
        initialize: initialize
    };
});
