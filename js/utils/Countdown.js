define('Plugbot/utils/Countdown', [
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
                    countdown: 0
                },
                /**
                 * Default, single object runtime
                 */
                defaultRuntime: {
                    suspended: false,
                    elapsed: 0,
                    waitCallbacks: []
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
            var i, items, isEmpty, id, item, options, runtime;

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

                        runtime.elapsed += this.interval;

                        // check to remove the id
                        if (runtime.elapsed >= options.countdown) {
                            if (undefined !== options.call) {
                                options.call();

                                for (i = 0; i < runtime.waitCallbacks.length;
                                        i += 1) {
                                    runtime.waitCallbacks[i]();
                                }
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
                countdown: defOptions.countdown
            });

            // push new item
            this.items[id] = {
                options: options,
                runtime: {
                    suspended: defRuntime.suspended,
                    elapsed: defRuntime.elapsed,
                    waitCallbacks: defRuntime.waitCallbacks
                }
            };

            // check to start
            if (!this.enabled) {
                if (this.autoStart) {
                    this.start();
                }
            }

            return this;
        },
        remove: function (id) {
            if (undefined === this.items[id]) { return this; }
            delete this.items[id];

            return this;
        },
        wait: function (id, callback) {
            this.items[id].runtime.waitCallbacks.push(callback);
        },
        suspend: function (id) {
            this.items[id].runtime.suspended = true;
            return this;
        },
        resume: function (id) {
            this.items[id].runtime.suspended = false;
            return this;
        },
        setCountdown: function (id, time) {
            this.items[id].options.countdown = time;
            return this;
        },
        callAndRemove: function (id) {
            this.items[id].options.call();
            delete this.items[id];

            return this;
        },
        setElapsed: function (id, time) {
            this.items[id].runtime.elapsed = time;
            return this;
        },
        resetElapsed: function (id) {
            this.items[id].runtime.elapsed = 0;
            return this;
        },
        delay: function (id, time) {
            this.items[id].runtime.elapsed -= time;
            return this;
        },
        forward: function (id, time) {
            this.items[id].runtime.elapsed += time;
            return this;
        }
    });

    return Model;
});
