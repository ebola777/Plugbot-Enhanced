define(['plugbot/services/module', 'angular'], function (module, angular) {
    'use strict';

    module.factory('SiteApi', ['$interval', '$window', function ($interval, $window) {
        var API = $window.API,
            elemWoot = angular.element('#woot'),
            idWoot,
            idJoin;

        return {
            woot: function () {
                var that = this;

                this.stopWoot();

                idWoot = $interval(function () {
                    var userVote = API.getUser().vote;

                    if (0 === userVote) {
                        elemWoot.click();
                    } else {
                        that.stopWoot();
                    }
                }, 1000);
            },
            join: function () {
                var that = this;

                this.stopJoin();

                idJoin = $interval(function () {
                    var joinResult = API.djJoin();

                    if (!joinResult) {
                        that.stopJoin();
                    }
                }, 1000);
            },
            stopWoot: function () {
                $interval.cancel(idWoot);
            },
            stopJoin: function () {
                $interval.cancel(idJoin);
            },
            autoWoot: function (isEnabled) {
                if (isEnabled) {
                    API.on(API.ADVANCE, this.woot, this);
                    this.woot();
                } else {
                    API.off(API.ADVANCE, this.woot);
                    this.stopWoot();
                }
            },
            autoJoin: function (isEnabled) {
                if (isEnabled) {
                    API.on(API.WAIT_LIST_UPDATE, this.join, this);
                    this.join();
                } else {
                    API.off(API.WAIT_LIST_UPDATE, this.join);
                    this.stopJoin();
                }
            },
            destroy: function () {
                this.autoWoot(false);
                this.autoJoin(false);
            }
        };
    }]);
});
