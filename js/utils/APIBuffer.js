define('Plugbot/utils/APIBuffer', [], function () {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function addListening(id, listener, events, options) {
        var i,
            fnListenTo = function (event, options) {
                listener.listenTo(API, event, function () {
                    Plugbot.ticker.addId(id, function () {
                        if (undefined !== options.fnCheck) {
                            if (options.fnCheck()) {
                                options.callback();
                            }
                        } else {
                            options.callback();
                        }
                    }, {
                        interval: Plugbot.tickerInterval.APICallback
                    });
                });
            };

        options = options || {};
        _.defaults(options, {
            fnCheck: undefined,
            callback: undefined
        });

        for (i = 0; i !== events.length; i += 1) {
            fnListenTo(events[i], options);
        }
    }

    function stopListening(listener, events) {
        var i,
            fnStopListenTo = function (event) {
                listener.stopListening(API, event);
            };

        if (undefined === events) {
            listener.stopListening(API);
        } else {
            for (i = 0; i !== events.length; i += 1) {
                fnStopListenTo(events[i]);
            }
        }
    }

    //endregion

    return {
        addListening: addListening,
        stopListening: stopListening
    };
});
