define(['plugbot/services/module', 'angular'], function (module, angular) {
    'use strict';

    module.factory('Export', ['$window', 'Settings', function ($window, Settings) {
        $window.plugbot = {
            version: '2.0.5',
            dev: {
                getSiteHighestZIndex: function () {
                    var elements = angular.element(
                            '#audience, #dj-booth, #playback-container, #dj-button, #vote, .app-right'),
                        ret = {
                            element: null,
                            zIndex: -1
                        };

                    _.each(elements, function (element) {
                        var zIndex = angular.element(element).css('z-index');

                        if (zIndex > ret.zIndex) {
                            ret = {
                                element: element,
                                zIndex: zIndex
                            };
                        }
                    });

                    return ret;
                }
            },
            resetSettings: function () {
                Settings.reset();
            }
        };
    }]);
});
