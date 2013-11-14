define('Plugbot/main/Dispose', [
    'Plugbot/Entry',
    'Plugbot/Loader',
    'Plugbot/store/LocalStorage',
    'Plugbot/utils/Helpers',
    'Plugbot/events/SiteEvents',
    'Plugbot/main/WindowManager'
], function (Entry, Loader, LocalStorage, Helpers, SiteEvents, WindowManager) {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function initialize() {
        /**
         * Dispose resources and close
         */
        Plugbot.disposeAndClose = function () {
            LocalStorage.clearSettings();

            Plugbot.close({saveSettings: false});
        };

        /**
         * Dispose resources and reload
         */
        Plugbot.disposeAndReload = function () {
            LocalStorage.clearSettings();

            Plugbot.reload({saveSettings: false});
        };

        /**
         * Close PlugBot
         */
        Plugbot.close = function (options) {
            close(options);

            // remove plugbot namespace
            delete window.Plugbot;
        };

        /**
         * Reload PlugBot
         */
        Plugbot.reload = function (options) {
            var i,
                preserveFunctions = [
                    'simpleRemove',
                    'initDone'
                ],
                tmp = {};

            // override options
            options = options || {};
            options.removeEntryLoader = false;

            close(options);

            // preverse PlugBot functions
            for (i = 0; i !== preserveFunctions.length; i += 1) {
                tmp[preserveFunctions[i]] = Plugbot[preserveFunctions[i]];
            }

            // re-declare namespace
            delete window.Plugbot;
            window.Plugbot = {};

            // add back preserved functions
            for (i = 0; i !== preserveFunctions.length; i += 1) {
                Plugbot[preserveFunctions[i]] = tmp[preserveFunctions[i]];
            }

            // init loader
            Loader.initialize();
        };
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    /**
     * Close Plugbot
     */
    function close(options) {
        options = options || {};
        _.defaults(options, {
            saveSettings: true,
            removeEntryLoader: true
        });

        /**
         * #1: Utilities
         */
        // save settings
        if (options.saveSettings) {
            LocalStorage.saveSettings();
        }

        // remove handlebars helpers
        Helpers.removeHandlebarsHelpers();

        // remove utilities
        Plugbot.ticker.close();

        /**
         * #2: Events
         */
        // remove dispatcher
        SiteEvents.removeDispatcher();

        /**
         * #3: UIs
         */
        // remove UIs
        removeUis();

        /**
         * #4: Libraries, Loader, Entry
         */
        // remove IDs from RequireJS
        removeDefs(options.removeEntryLoader);

        // remove css files
        removeCssFiles();
    }

    /**
     * Remove definitions from RequireJS
     */
    function removeDefs(removeEntryLoader) {
        var i;

        // entry & loader
        if (removeEntryLoader) {
            requirejs.undef('Plugbot/Entry');
            requirejs.undef('Plugbot/Loader');
        }

        // core scripts
        if ('DEBUG' === Entry.environment) {
            for (i = 0; i !== Entry.scripts.length; i += 1) {
                requirejs.undef(Entry.scripts[i]);
            }
        }
    }

    /**
     * Remove css files
     */
    function removeCssFiles() {
        $(document.head).children('.' + Entry.cssClassname).remove();
    }

    /**
     * Remove Uis
     */
    function removeUis() {
        WindowManager.removeTaskbar();
        WindowManager.removeWindows();
    }

    //endregion

    return {
        initialize: initialize
    };
});
