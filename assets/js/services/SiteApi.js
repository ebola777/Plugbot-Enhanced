define(["plugbot/services/module", "angular"], function (module, angular) {
    "use strict";

    module.factory("SiteApi", ["$http", "$interval", "$window", function ($http, $interval, $window) {
        var API = $window.API;
        var idWoot;
        var idJoin;
        var listMediaChange;

        return {
            woot: function () {
                var that = this;

                this.stopWoot();

                idWoot = $interval(function () {
                    var elemWoot = angular.element("#woot");
                    var user = API.getUser();
                    var dj = API.getDJ();

                    if (dj && dj.id !== user.id && user.vote === 0) {
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
            getMedia: function (callback, media) {
                var mediaDetails;

                if (!media) {
                    media = API.getMedia();
                }

                if (media) {
                    mediaDetails = {};

                    if (media.format === 1) {
                        mediaDetails.format = "youtube";
                        mediaDetails.url = "//www.youtube.com/watch?v=" + media.cid;
                        callback(mediaDetails);
                    } else {
                        mediaDetails.format = "soundcloud";
                        $http
                            .get("//api.soundcloud.com/tracks/" + media.cid +
                            ".json?client_id=YOUR_CLIENT_ID")
                            .then(function (data) {
                                mediaDetails.url = data.data.permalink_url;
                            }, function () {
                                mediaDetails.url = null;
                            })
                            .then(function () {
                                callback(mediaDetails);
                            });
                    }
                }
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
            onMediaChange: function (data) {
                var that = this;

                _.each(listMediaChange, function (callback) {
                    callback.onAdvance();
                    that.getMedia(callback.onResolved, data.media);
                });
            },
            bindMediaChange: function (id, onAdvance, onResolved) {
                if (!listMediaChange) {
                    API.on(API.ADVANCE, this.onMediaChange, this);
                    listMediaChange = {};
                }

                listMediaChange[id] = {
                    onAdvance: onAdvance,
                    onResolved: onResolved
                };
            },
            unbindMediaChange: function (id) {
                if (id) {
                    delete listMediaChange[id];
                } else {
                    API.off(API.ADVANCE, this.onMediaChange);
                    listMediaChange = {};
                }
            },
            destroy: function () {
                this.autoWoot(false);
                this.autoJoin(false);
                this.unbindMediaChange();
            }
        };
    }]);
});