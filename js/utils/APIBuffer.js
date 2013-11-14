define('Plugbot/utils/APIBuffer', [
    'Plugbot/events/BaseEvents'
], function (BaseEvents) {
    'use strict';

    //region VARIABLES =====
    var Events = {};

    //endregion


    //region CONSTRUCTORS =====
    (function () {
        _.extend(Events, BaseEvents);

        addAPIEvents();
    }());

    //endregion


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

    function stopListening(listener) {
        listener.stopListening(API);
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    function addAPIEvents() {
        var key, item;

        for (key in API) {
            if (API.hasOwnProperty(key)) {
                item = API[key];

                if ('string' === typeof item) {
                    // add event to this event
                    Events[key] = item;
                }
            }
        }
    }

    //endregion

    return {
        // events
        Events: Events,

        // methods
        addListening: addListening,
        stopListening: stopListening
    };
});
