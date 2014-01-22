/**
 * Watcher keeps calling function till the function returns exit code.
 * Unlike Ticker, interval is set when it is instantiated.
 */

define('Plugbot/utils/Watcher', [
    'Plugbot/base/Timer'
], function (BaseTimer) {
    'use strict';

    var Model = BaseTimer.extend({
        defaults: function () {
            return {
                /**
                 * Default, read-only
                 */
                call: undefined,
                args: undefined,
                exitValue: 0,
                exitCall: undefined,
                maxNumCall: 0
            };
        },
        initialize: function () {
            this.parent = BaseTimer.prototype;
            this.parent.initialize.call(this);

            // extend parent defaults
            _.defaults(this.attributes, this.parent.defaults());
        },
        fnTick: function () {
            var items, isEmpty, id, item, options, runtime, ret, enMaxNumCall;

            if (this.suspendedAll) { return; }

            isEmpty = true;
            items = this.items;
            for (id in items) {
                if (items.hasOwnProperty(id)) {
                    isEmpty = false;

                    item = items[id];
                    runtime = item.runtime;

                    if (!runtime.suspended) {
                        options = item.options;

                        enMaxNumCall = (0 !== options.maxNumCall);

                        // call function and get return value
                        ret = options.call.apply(this, options.args);

                        // increase number of calls
                        if (enMaxNumCall) {
                            runtime.numCall += 1;
                        }

                        // check to remove the id (exit value & max num call)
                        if ((ret === options.exitValue) ||
                                (enMaxNumCall &&
                                runtime.numCall > options.maxNumCall)) {
                            if (_.isFunction(options.exitCall)) {
                                options.exitCall();
                            }

                            this.remove(id);
                        } else {
                            this.items[id].runtime = runtime;
                        }
                    }
                }
            }

            if (isEmpty && this.get('exitWhenNoCall')) {
                this.close();
            }
        },
        /**
         * Add a call. But cannot be removed later, can only be removed when
         * calling clear or close.
         * @param {function} fn         Function call
         * @param {Object=} options     Options
         */
        addFn: function (fn, options) {
            this.add('d' + Date.now(), fn, options);

            return this;
        },
        /**
         * Add a call. The watcher will start automatically once a function
         * is added.
         * @param {(number|string)} id  ID
         * @param {function} fn         Function to be called
         * @param {Object=} options     Options
         */
        add: function (id, fn, options) {
            // check repetition
            if (undefined !== this.items[id]) { return this; }

            // use default attributes if parameters are not defined
            options = options || {};
            _.defaults(options, {
                call: fn,
                exitValue: this.get('exitValue'),
                exitCall: this.get('exitCall'),
                maxNumCall: this.get('maxNumCall')
            });

            // push new item
            this.items[id] = {
                options: options,
                runtime: {
                    suspended: false,
                    numCall: 0
                }
            };

            // check to start
            if (!this.enabled) {
                if (this.get('autoStart')) {
                    this.start();
                }
            }

            return this;
        },
        /**
         * Remove a call
         * @param {function} id   Function to be removed (No parameters)
         */
        remove: function (id) {
            if (undefined === this.items[id]) { return this; }
            delete this.items[id];

            return this;
        },
        suspend: function (id) {
            this.items[id].runtime.suspended = true;
            return this;
        },
        resume: function (id) {
            this.items[id].runtime.suspended = false;
            return this;
        }
    });

    return Model;
});
