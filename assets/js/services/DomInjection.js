define(['plugbot/services/module', 'angular'], function (module, angular) {
    'use strict';

    module.factory('DomInjection', ['$templateCache', function ($templateCache) {
        var elemApp = angular.element('#app');

        elemApp.append($templateCache.get('main.tpl.html'));
        elemApp.append($templateCache.get('settings.tpl.html'));
    }]);
});
