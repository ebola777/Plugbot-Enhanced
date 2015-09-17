define(["plugbot/controllers/module"], function (module) {
    "use strict";

    module.controller("MainCtrl", ["$scope", "Settings", "SiteApi", function ($scope, Settings, SiteApi) {
        var EVENT_ID_MEDIA_CHANGE = "main_ctrl.media_link";
        var settings = Settings.read().main;

        function onItemClick(item) {
            var isEnabled = !settings[item.id];

            if (_.isFunction(item.switchEnabled)) {
                item.switchEnabled(isEnabled);
            }

            settings[item.id] = isEnabled;
            Settings.save();
        }

        function initEnabled(item) {
            item.switchEnabled(settings[item.id]);
        }

        function onMediaResolved(media) {
            if (media && media.url) {
                $scope.mediaUrl = media.url;
            } else {
                $scope.mediaUrl = null;
            }
        }

        $scope.items = [{
            id: "autoWoot",
            text: "Auto Woot",
            initialize: initEnabled,
            handlerClick: onItemClick,
            switchEnabled: function (isEnabled) {
                SiteApi.switchAutoWoot(isEnabled);
            }
        }, {
            id: "autoJoin",
            text: "Auto Join",
            initialize: initEnabled,
            handlerClick: onItemClick,
            switchEnabled: function (isEnabled) {
                SiteApi.switchAutoJoin(isEnabled);
            }
        }];

        $scope.isExpanded = false;

        $scope.mediaUrl = null;

        $scope.handleButtonClick = function () {
            return "toggle";
        };

        $scope.isEnabled = function (item) {
            return settings[item.id];
        };

        $scope.click = function (item) {
            if (_.isFunction(item.handlerClick)) {
                item.handlerClick(item);
            }
        };

        $scope.getMediaLink = function () {
            SiteApi.getMedia(onMediaResolved);
        };

        /*
         * Initialize
         */
        _.each($scope.items, function (item) {
            if (_.isFunction(item.initialize)) {
                item.initialize(item);
            }
        });

        SiteApi.getMedia(onMediaResolved);
        SiteApi.bindMediaChange(EVENT_ID_MEDIA_CHANGE, function () {
            $scope.mediaUrl = null;
        }, onMediaResolved);

        /*
         * Destroy
         */
        $scope.$on("$destroy", function () {
            SiteApi.switchAutoWoot(false);
            SiteApi.switchAutoJoin(false);
            SiteApi.unbindMediaChange(EVENT_ID_MEDIA_CHANGE);
        });
    }]);
});
