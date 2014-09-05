define(['plugbot/services/module'], function (module) {
    'use strict';

    module.factory('Settings', ['$window', function ($window) {
        var KEY = 'plugbotEnhanced',
            localStorage = $window.localStorage,
            defaults = {
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
            },
            settings;

        return {
            read: function () {
                var ret;

                if (settings) {
                    ret = settings;
                } else {
                    if (localStorage[KEY]) {
                        ret = JSON.parse(localStorage[KEY]);
                    } else {
                        ret = this._clone();
                    }

                    settings = ret;
                }

                return ret;
            },
            save: function () {
                this._debounceSave();
            },
            reset: function () {
                delete localStorage[KEY];
            },
            _debounceSave: _.debounce(function () {
                localStorage[KEY] = JSON.stringify(settings);
            }, 1000),
            _clone: function () {
                return JSON.parse(JSON.stringify(defaults));
            }
        };
    }]);
});
