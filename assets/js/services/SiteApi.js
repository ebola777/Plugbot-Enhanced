define(["plugbot/services/module", "angular"], function (module, angular) {
    "use strict";

    module.factory("SiteApi", ["$http", "$interval", "$window", function ($http, $interval, $window) {
        var INTERVAL_RETRY = 1000;
        var SOUNDCLOUD_CLIENT_ID = "62aea2074fda13af246f37bb63c1761e";

        var API = $window.API;
        var idWoot;
        var idJoin;
        var eventHandlersMediaChange;

        function getMedia(callback, media) {
            var mediaDetails;

            if (!media) {
                media = API.getMedia();
            }

            if (media) {
                mediaDetails = {};

                if (media.format === 1) {
                    mediaDetails.format = "youtube";
                    mediaDetails.url = "https://www.youtube.com/watch?v=" + media.cid;
                    callback(mediaDetails);
                } else {
                    mediaDetails.format = "soundcloud";
                    $http
                        .get("https://api.soundcloud.com/tracks/" + media.cid +
                        "?client_id=" + SOUNDCLOUD_CLIENT_ID)
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
        }

        function stopWoot() {
            $interval.cancel(idWoot);
        }

        function stopJoin() {
            $interval.cancel(idJoin);
        }

        function woot() {
            stopWoot();

            idWoot = $interval(function () {
                var elemWoot = angular.element("#woot");
                var user = API.getUser();
                var dj = API.getDJ();

                if (dj && dj.id !== user.id && user.vote === 0) {
                    elemWoot.click();
                } else {
                    stopWoot();
                }
            }, INTERVAL_RETRY);
        }

        function join() {
            stopJoin();

            idJoin = $interval(function () {
                var joinResult = API.djJoin();

                if (!joinResult) {
                    stopJoin();
                }
            }, INTERVAL_RETRY);
        }

        function switchAutoWoot(isEnabled) {
            if (isEnabled) {
                API.on(API.ADVANCE, woot);
                woot();
            } else {
                API.off(API.ADVANCE, woot);
                stopWoot();
            }
        }

        function switchAutoJoin(isEnabled) {
            if (isEnabled) {
                API.on(API.WAIT_LIST_UPDATE, join);
                join();
            } else {
                API.off(API.WAIT_LIST_UPDATE, join);
                stopJoin();
            }
        }

        function onMediaChange(data) {
            _.each(eventHandlersMediaChange, function (callback) {
                callback.onAdvance();
                getMedia(callback.onResolved, data.media);
            });
        }

        function bindMediaChange(eventId, onAdvance, onResolved) {
            if (!eventHandlersMediaChange) {
                API.on(API.ADVANCE, onMediaChange);
                eventHandlersMediaChange = {};
            }

            eventHandlersMediaChange[eventId] = {
                onAdvance: onAdvance,
                onResolved: onResolved
            };
        }

        function unbindMediaChange(eventId) {
            if (eventId) {
                delete eventHandlersMediaChange[eventId];
            } else {
                API.off(API.ADVANCE, onMediaChange);
                eventHandlersMediaChange = {};
            }
        }

        function destroy() {
            switchAutoWoot(false);
            switchAutoJoin(false);
            unbindMediaChange();
        }

        return {
            woot: woot,
            join: join,
            getMedia: getMedia,
            switchAutoWoot: switchAutoWoot,
            switchAutoJoin: switchAutoJoin,
            onMediaChange: onMediaChange,
            bindMediaChange: bindMediaChange,
            unbindMediaChange: unbindMediaChange,
            destroy: destroy
        };
    }]);
});
