/**
 * Ticker queues functions and calls them later,
 * like underscore throttle function
 */

define('Plugbot/utils/Ticker', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                /**
                 * Default
                 */
                interval: 'optimal',
                defaultHz: 1,
                /**
                 * Runtime
                 */
                // IDs (key: id, value: id of setTimeout)
                ids: {}
            };
        },
        initialize: function () {
            _.bindAll(this);

            // extend attributes to this
            _.defaults(this, this.attributes);

            // extend defaults to this
            _.defaults(this, this.defaults());
        },
        /**
         * Add a function call by id
         * @param {number|String} id    Id
         * @param {function} fn         Function to be called (No parameters)
         * @param {Object=} options    Options
         */
        add: function (id, fn, options) {
            var that = this,
                interval,
                currentTick,
                remainingTime;

            // check if the function has been included
            if (undefined !== this.ids[id]) { return this; }

            // apply default settings
            options = options || {};
            _.defaults(options, {
                interval: this.interval
            });

            // set remaining time
            interval = options.interval;

            if (interval === 'optimal') {
                interval = Math.round(1000 / this.optimalHz);
            } else if (this.interval.substr(-2) === 'hz') {
                interval = Math.round(1000 /
                    +interval.substr(0, interval.length - 2));
            }

            currentTick = (new Date()).getTime();
            remainingTime = interval - (currentTick % interval);

            this.ids[id] = setTimeout(function () {
                // invoke
                fn.call(that);

                // remove this key
                delete that.ids[id];
            }, remainingTime);

            return this;
        },
        /**
         * Remove an id
         * @param {number|string} id   Id
         */
        remove: function (id) {
            clearInterval(this.ids[id]);
            delete this.ids[id];

            return this;
        },
        has: function (id) {
            return (undefined !== this.ids[id]);
        },
        /**
         * Clear all calls
         */
        clear: function () {
            var ids = this.ids, key;

            for (key in ids) {
                if (ids.hasOwnProperty(key)) {
                    this.remove(key);
                }
            }

            return this;
        },
        close: function () {
            this.clear();
        }
    });

    return Model;
});
