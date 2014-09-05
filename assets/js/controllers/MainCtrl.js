define(['plugbot/controllers/module'], function (module) {
    'use strict';

    module.controller('MainCtrl', ['$scope', 'Settings', 'SiteApi', function ($scope, Settings, SiteApi) {
        var settings = Settings.read().main;

        $scope.items = [{
            id: 'autoWoot',
            text: 'Auto Woot',
            click: function (isEnabled) {
                SiteApi.autoWoot(isEnabled);
            }
        }, {
            id: 'autoJoin',
            text: 'Auto Join',
            click: function (isEnabled) {
                SiteApi.autoJoin(isEnabled);
            }
        }];

        $scope.isEnabled = function (item) {
            return settings[item.id];
        };

        $scope.switchEnabled = function (item) {
            var isEnabled = !settings[item.id];

            if (item.click) { item.click(isEnabled); }

            settings[item.id] = isEnabled;
            Settings.save();
        };

        $scope.handleButtonClick = function () {
            return 'toggle';
        };

        // init
        _.each($scope.items, function (item) {
            item.click(settings[item.id]);
        });
    }]);
});
