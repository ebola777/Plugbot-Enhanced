/**
 * App bootstrap, load dependencies.
 *
 * @module plugbot/main
 * @author ebola777@yahoo.com.tw (Shawn Chang)
 * @copyright Shawn Chang 2013
 * @license MIT
 */

require(["angular", "domReady"], function (angular, domReady) {
    "use strict";

    // Wait for DOMs to be ready
    domReady(function () {
        // Require app
        require(["plugbot/app"], function () {
            angular.bootstrap(angular.element("#app"), ["app"]);
        });
    });
});
