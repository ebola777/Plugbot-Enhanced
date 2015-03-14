define(["plugbot/services/module"], function (module) {
    "use strict";

    module.factory("Settings", ["$window", function ($window) {
        var KEY = "plugbotEnhanced";
        var INTERVAL_DEBOUNCE_SAVE = 1000;

        var localStorage = $window.localStorage;
        var defaults = {
            main: {
                autoWoot: true,
                autoJoin: false
            },
            window: {
                main: {
                    x: 70,
                    y: 85
                },
                settings: {
                    x: 80,
                    y: 100
                }
            }
        };
        var settings;

        return {
            read: function () {
                if (!settings) {
                    if (localStorage[KEY]) {
                        // Get settings from local storage.
                        settings = JSON.parse(localStorage[KEY]);
                    } else {
                        // Clone settings from defaults.
                        settings = JSON.parse(JSON.stringify(defaults));
                    }
                }

                return settings;
            },
            save: function () {
                this.debounceSave();
            },
            reset: function () {
                delete localStorage[KEY];
            },
            debounceSave: _.debounce(function () {
                localStorage[KEY] = JSON.stringify(settings);
            }, INTERVAL_DEBOUNCE_SAVE)
        };
    }]);
});
