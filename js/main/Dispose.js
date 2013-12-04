define('Plugbot/main/Dispose', [
    'Plugbot/Entry',
    'Plugbot/Loader',
    'Plugbot/events/SiteEvents',
    'Plugbot/main/Settings',
    'Plugbot/main/WindowManager',
    'Plugbot/utils/APIBuffer',
    'Plugbot/utils/Helpers'
], function (Entry, Loader, SiteEvents, Settings, WindowManager, APIBuffer,
             Helpers) {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function initialize() {
        /**
         * Dispose resources and close
         */
        Plugbot.disposeAndClose = function () {
            Settings.clearSettings();

            Plugbot.close({saveSettings: false});
        };

        /**
         * Dispose resources and reload
         */
        Plugbot.disposeAndReload = function () {
            Settings.clearSettings();

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
                    'initDone'
                ],
                tmp = {};

            // override options
            options = options || {};
            options.removeEntryAndLoader = false;

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
            removeEntryAndLoader: true
        });

        /**
         * #1: Utilities
         */
        // save settings
        if (options.saveSettings) {
            Settings.saveSettings({immediate: true});
        }

        // remove handlebars helpers
        Helpers.removeHandlebarsHelpers();

        // remove utilities
        Plugbot.watcher.close();
        Plugbot.ticker.close();

        // close APIBuffer
        APIBuffer.close();

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
        removeDefs(options.removeEntryAndLoader);

        // remove css files
        removeCssFiles();
    }

    /**
     * Remove definitions from RequireJS
     */
    function removeDefs(removeEntryAndLoader) {
        var i;

        // entry & loader
        if (removeEntryAndLoader) {
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
        WindowManager.removeEvents();
    }

    //endregion

    return {
        initialize: initialize
    };
});
