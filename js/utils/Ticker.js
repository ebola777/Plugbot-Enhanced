/**
 * Ticker queues functions and calls them later,
 * ex. interval is set to 5sec, Ticker will call them at the next closest
 * time of 0sec, 5sec, 10sec, ... 60sec. If a function is added at 3sec, it
 * will be called at 5sec.
 * All function calls are removed after they have been called.
 */

define('Plugbot/utils/Ticker', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                /**
                 * Default
                 */
                interval: 1000,
                /**
                 * Runtime
                 */
                // functions waiting to be called
                calls: []
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
         * Add a function call
         * @param {Function} fn       Function to be called (No parameters)
         * @param {Object|undefined} options     Options
         */
        add: function (fn, options) {
            var that = this,
                interval,
                currentTick,
                remainingTime;

            // check if the function has been included
            if (-1 !== this.calls.indexOf(fn)) { return; }

            // apply default settings
            options = options || {};
            _.defaults(options, {
                interval: this.interval
            });

            interval = options.interval;

            // include the function
            this.calls.push(fn);

            // set variables
            currentTick = (new Date()).getTime();
            remainingTime = interval - (currentTick % interval);

            setTimeout(function () {
                var ind;

                // check if the function still exists
                ind = that.calls.indexOf(fn);
                if (-1 === ind) { return; }

                // invoke
                fn();

                // remove function from list
                that.calls.splice(ind, 1);
            }, remainingTime);
        },
        /**
         * Add a function call by id
         * @param {Number|String} id    Id
         * @param {Function} fn         Function to be called (No parameters)
         * @param {Object|undefined} options    Options
         */
        addId: function (id, fn, options) {
            var that = this,
                interval,
                currentTick,
                remainingTime;

            // check if the function has been included
            if (-1 !== this.calls.indexOf(id)) { return; }

            // apply default settings
            options = options || {};
            _.defaults(options, {
                interval: this.interval
            });

            interval = options.interval;

            // include the id and function
            this.calls.push(id);

            // set variables
            currentTick = (new Date()).getTime();
            remainingTime = interval - (currentTick % interval);

            setTimeout(function () {
                var ind;

                // check if the id still exists
                ind = that.calls.indexOf(id);
                if (-1 === ind) { return; }

                // invoke
                fn();

                // remove function from list
                that.calls.splice(ind, 1);
            }, remainingTime);
        },
        /**
         * Remove a call
         * @param {Function} fn   Function to be removed (No parameters)
         */
        remove: function (fn) {
            var ind = this.calls.indexOf(fn);

            if (-1 !== ind) {
                this.calls.splice(ind, 1);
            }
        },
        /**
         * Remove an id
         * @param {Number|String} id   Id
         */
        removeId: function (id) {
            this.remove(id);
        },
        /**
         * Clear all calls
         */
        clear: function () {
            this.calls = [];
        },
        close: function () {
            this.clear();
        }
    });

    return Model;
});
