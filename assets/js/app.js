/**
 * Application file.
 *
 * @module plugbot/app
 * @author ebola777@yahoo.com.tw (Shawn Chang)
 * @copyright Shawn Chang 2013
 * @license MIT
 */

define([
    "angular",
    "plugbot/controllers/index",
    "plugbot/directives/index",
    "plugbot/services/index",
    "plugbot/views/index"
], function (angular) {
    "use strict";

    var app = angular.module("app", [
        "app.controllers",
        "app.directives",
        "app.services",
        "app.views"
    ]);

    // Inject DOMs and export APIs.
    app.run(["DomInjection", "Export", _.noop]);

    return app;
});
