define([
    'angular',
    'plugbot/controllers/index',
    'plugbot/directives/index',
    'plugbot/services/index',
    'plugbot/views/index'
], function (angular) {
    'use strict';

    var app = angular.module('app', [
        'app.controllers',
        'app.directives',
        'app.services',
        'app.views'
    ]);

    // inject DOMs and export interface
    app.run(['DomInjection', 'Export', _.identity]);

    return app;
});
