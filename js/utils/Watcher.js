/**
 * Watcher keeps calling function till the function returns exit code.
 * Unlike Ticker, interval is set when it is instantiated.
 */

define('Plugbot/utils/Watcher', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                /**
                 * Default, public
                 */
                interval: 'optimal',
                optimalHz: 12,
                autoStart: true,
                exitWhenNoCall: true,
                /**
                 * Default, single object overridable
                 */
                exitValue: 0,
                exitCall: null,
                maxNumCall: 0,
                /**
                 * Runtime
                 */
                watching: false,
                call: [],
                // number of calls that have been done
                numCall: [],
                // individual option
                options: [],
                // id returned from setInterval
                idInterval: undefined,
                // suspended or not
                isSuspended: false
            };
        },
        initialize: function () {
            _.bindAll(this);

            // extend attributes to this
            _.defaults(this, this.attributes);

            // extend defaults to this
            _.defaults(this, this.defaults());
        },
        watch: function () {
            // set interval
            if (this.interval === 'optimal') {
                this.interval = Math.round(1000 / this.optimalHz);
            } else if (this.interval.substr(-2) === 'hz') {
                this.interval = Math.round(1000 /
                    +this.interval.substr(0, this.interval.length - 2));
            }

            this.watching = true;

            this.idInterval =
                window.setInterval(this.fnWatch, +this.interval);
        },
        fnWatch: function () {
            var i, ret, opt, numCall,
                isExitValue, isMaxCall;

            // by setInterval
            if (this.isSuspended) { return; }

            i = 0;
            while (i < this.call.length) {
                numCall = this.numCall[i];
                opt = this.options[i];

                ret = this.call[i](opt.args);
                numCall += 1;

                // check exit value
                if (opt.exitValue === ret) {
                    isExitValue = true;
                } else {
                    // check max number of calls
                    if (0 !== opt.maxNumCall &&
                            numCall > opt.maxNumCall) {
                        isMaxCall = true;
                    }
                }

                if (isExitValue || isMaxCall) {
                    if (null !== opt.exitCall) {
                        opt.exitCall();
                    }

                    this.call.splice(i, 1);
                    this.numCall.splice(i, 1);
                    this.options.splice(i, 1);

                    if (0 === this.call.length &&
                            this.exitWhenNoCall) {
                        this.close();
                        return;
                    }
                } else {
                    if (0 !== opt.maxNumCall) {
                        this.numCall[i] = numCall;
                    }

                    i += 1;
                }
            }

            if (0 === i && this.exitWhenNoCall) {
                this.close();
            }
        },
        /**
         * Add a call. The watcher will start automatically once a function
         * is added.
         * @param {Function} fn       Function to be called (No parameters)
         * @param {Object|undefined} options     Options (exitValue,
         *      maxNumCall)
         */
        add: function (fn, options) {
            // check if the function has been included
            if (-1 !== this.call.indexOf(fn)) { return; }

            // use default attributes if parameters are not defined
            options = options || {};
            _.defaults(options, {
                exitValue: this.exitValue,
                exitCall: this.exitCall,
                maxNumCall: this.maxNumCall
            });

            // include the function
            this.call.push(fn);
            this.numCall.push(0);
            this.options.push(options);

            // check to start watching
            if (!this.watching) {
                if (this.autoStart) {
                    this.watch();
                }
            }
        },
        /**
         * Remove a call
         * @param {Function} fn   Function to be removed (No parameters)
         */
        remove: function (fn) {
            var ind = this.call.indexOf(fn);

            if (-1 !== ind) {
                this.call.splice(ind, 1);
                this.numCall.splice(ind, 1);
                this.options.splice(ind, 1);
            }
        },
        invoke: function () {
            this.fnWatch();
        },
        suspend: function () {
            this.isSuspended = true;
        },
        resume: function () {
            this.isSuspended = false;
        },
        /**
         * Clear all calls
         */
        clear: function () {
            this.call = [];
            this.numCall = [];
            this.options = [];
        },
        close: function () {
            clearInterval(this.idInterval);

            this.clear();
        }
    });

    return Model;
});
