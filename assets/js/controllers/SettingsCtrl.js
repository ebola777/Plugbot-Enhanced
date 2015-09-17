define(["plugbot/controllers/module"], function (module) {
    "use strict";

    module.controller("SettingsCtrl", ["$scope", "$window", "Settings", function ($scope, $window, Settings) {
        $scope.items = [{
            text: "Reset Settings",
            click: function () {
                if ($window.confirm("Reset settings?\n" +
                        "Please reload the webpage after clicking OK.")) {
                    Settings.reset();
                }
            }
        }];

        $scope.handleButtonClick = function () {
            return "hide";
        };
    }]);
});
