/**
 * Watcher keeps calling function till the function returns exit code.
 * Unlike Ticker, interval is set when it is instantiated.
 */

define('Plugbot/utils/Watcher', [
    'Plugbot/base/Timer',
    'Plugbot/utils/Helpers'
], function (BaseTimer, Helpers) {
    'use strict';

    var Model = BaseTimer.extend({
        defaults: function () {
            return {
                /**
                 * Default, single object options
                 */
                defaultOptions: {
                    call: undefined,
                    args: undefined,
                    exitValue: 0,
                    exitCall: undefined,
                    maxNumCall: 0
                },
                /**
                 * Default, single object runtime
                 */
                defaultRuntime: {
                    suspended: false,
                    numCall: 0
                }
            };
        },
        initialize: function () {
            _.bindAll(this);
            this.parent = BaseTimer.prototype;
            this.parent.initialize.call(this);

            // extend defaults to this
            _.defaults(this, this.parent.defaults());
            Helpers.defaultsDeep(this.defaults(), this);
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
                        ret = options.call.apply(null, options.args);

                        // increase number of calls
                        if (enMaxNumCall) {
                            runtime.numCall += 1;
                        }

                        // check to remove the id (exit value & max num call)
                        if ((ret === options.exitValue) ||
                                (enMaxNumCall &&
                                runtime.numCall > options.maxNumCall)) {
                            if (options.exitCall) {
                                options.exitCall();
                            }

                            this.remove(id);
                        } else {
                            this.items[id].runtime = runtime;
                        }
                    }
                }
            }

            if (isEmpty && this.exitWhenNoCall) {
                this.close();
            }
        },
        /**
         * Add a call. But cannot be removed later
         * @param {Function} fn     Function call
         */
        addFn: function (fn) {
            this.add(Date.now(), {
                call: fn
            });
        },
        /**
         * Add a call. The watcher will start automatically once a function
         * is added.
         * @param {Number|String} id   ID
         * @param {Object|undefined} options    Options
         */
        add: function (id, options) {
            var defOptions, defRuntime;

            // check repetition
            if (undefined !== this.items[id]) { return this; }

            defOptions = this.defaultOptions;
            defRuntime = this.defaultRuntime;

            // use default attributes if parameters are not defined
            options = options || {};
            _.defaults(options, {
                call: defOptions.call,
                exitValue: defOptions.exitValue,
                exitCall: defOptions.exitCall,
                maxNumCall: defOptions.maxNumCall
            });

            // push new item
            this.items[id] = {
                options: options,
                runtime: {
                    suspended: defRuntime.suspended,
                    numCall: defRuntime.numCall
                }
            };

            // check to start
            if (!this.enabled) {
                if (this.autoStart) {
                    this.start();
                }
            }
        },
        /**
         * Remove a call
         * @param {Function} id   Function to be removed (No parameters)
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
