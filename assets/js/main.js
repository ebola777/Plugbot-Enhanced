/**
 * App bootstrap
 */

/**
 * @license
 * Copyright (C) 2013-2014  Shawn
 * This program is licensed under the MIT license.
 */

// redundant require, used to hide dependencies
require(['angular'], function (angular) {
    'use strict';

    // require 3rd libraries here
    require(['domReady!', 'plugbot/app'], function () {
        angular.bootstrap(angular.element('#app'), ['app']);
    });
});
