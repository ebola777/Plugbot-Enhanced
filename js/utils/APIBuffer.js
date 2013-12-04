define('Plugbot/utils/APIBuffer', [
    'Plugbot/utils/Ticker'
], function (Ticker) {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                /**
                 * Runtime
                 */
                ticker: new Ticker()
            };
        },
        initialize: function () {
            _.bindAll(this);
            _.defaults(this, this.defaults());
        },
        /**
         * Listen for some API events
         * @param {(string|number)} id          ID
         * @param {Backbone.View} listener      Backbone view listener
         * @param {Array.<{event}>} events      Array of events
         * @param {Object=} options             Options
         */
        addListening: function (id, listener, events, options) {
            var that = this,
                i,
                fnListenTo = function (event, options) {
                    listener.listenTo(API, event, function () {
                        that.ticker.add(id, function () {
                            if (undefined !== options.fnCheck) {
                                if (options.fnCheck()) {
                                    options.callback();
                                }
                            } else {
                                options.callback();
                            }
                        }, {
                            interval:
                                Plugbot.settings.tickerInterval.APICallback
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
        },
        /**
         * Stop listening some API events
         * @param {Backbone.View} listener      Backbone view listener
         * @param {Array.<{event}>=} events     Array of events
         */
        stopListening: function (listener, events) {
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
        },
        close: function () {
            this.ticker.close();
        }
    });

    return new Model();
});
