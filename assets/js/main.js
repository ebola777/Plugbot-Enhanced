/**
 * App bootstrap
 */

// redundant require, used to hide dependencies
require(['angular'], function (angular) {
    'use strict';

    // require 3rd libraries here
    require(['domReady!', 'plugbot/app'], function () {
        angular.bootstrap(angular.element('#app'), ['app']);
    });
});
