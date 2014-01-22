define('Plugbot/main/Dispose', [
    'Plugbot/Entry',
    'Plugbot/Loader',
    'Plugbot/events/site/Events',
    'Plugbot/main/mgrs/ResourceManager',
    'Plugbot/main/Settings'
], function (Entry, Loader, SiteEvents, ResourceManager, Settings) {
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
         * Close Plugbot
         */
        Plugbot.close = function (options) {
            _close(options);

            // remove plugbot namespace
            delete window.Plugbot;
        };

        /**
         * Reload Plugbot
         */
        Plugbot.reload = function (options) {
            var preserveFunctions = [
                    'initDone'
                ],
                tmp;

            // override options
            options = options || {};
            options.removeEntryAndLoader = false;
            options.removeOtherScripts = false;

            _close(options);

            // preverse Plugbot functions
            tmp = _.pick(Plugbot, preserveFunctions);

            // re-declare namespace
            delete window.Plugbot;
            window.Plugbot = {};

            // add back preserved functions
            _.defaults(Plugbot, tmp);

            // init loader
            Loader.initialize();
        };
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    /**
     * Close Plugbot
     */
    function _close(options) {
        options = options || {};
        _.defaults(options, {
            saveSettings: true,
            removeEntryAndLoader: true,
            removeOtherScripts: true
        });

        /**
         * #1: Utilities
         */
        // save settings
        if (options.saveSettings) {
            Settings.saveSettings({immediate: true});
        }

        /**
         * #2: Events
         */
        // remove dispatcher
        SiteEvents.removeDispatcher();

        /**
         * #3: Resources
         */
        ResourceManager.close();

        /**
         * #4: Libraries, Loader, Entry
         */
        // remove IDs from RequireJS
        _removeDefs(options);

        // remove css files
        _removeCssFiles();
    }

    /**
     * Remove definitions from RequireJS
     */
    function _removeDefs(options) {
        var i;

        // entry & loader
        if (options.removeEntryAndLoader) {
            requirejs.undef('Plugbot/Entry');
            requirejs.undef('Plugbot/Loader');
        }

        // core scripts
        if (options.removeOtherScripts) {
            for (i = 0; i !== Entry.scripts.length; i += 1) {
                requirejs.undef(Entry.scripts[i]);
            }
        }
    }

    /**
     * Remove css files
     */
    function _removeCssFiles() {
        $(document.head).children('.' + Entry.cssClassname).remove();
    }

    //endregion

    return {
        initialize: initialize
    };
});
