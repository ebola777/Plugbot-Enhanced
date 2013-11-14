define('Plugbot/utils/Countdown', [], function () {
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
                exitWhenNoCall: false,
                /**
                 * Default, single object options
                 */
                call: undefined,
                countdown: 0,
                /**
                 * Default, single object runtime
                 */
                elapsed: 0,
                suspended: false,
                waitCallbacks: [],
                /**
                 * Runtime
                 */
                enabled: false,
                items: {},
                idInterval: undefined,
                suspendedAll: false
            };
        },
        initialize: function () {
            _.bindAll(this);

            // extend attributes to this
            _.defaults(this, this.attributes);

            // extend defaults to this
            _.defaults(this, this.defaults());
        },
        start: function () {
            // set interval
            if (this.interval === 'optimal') {
                this.interval = Math.round(1000 / this.optimalHz);
            } else if (this.interval.substr(-2) === 'hz') {
                this.interval = Math.round(1000 /
                    +this.interval.substr(0, this.interval.length - 2));
            }

            // start
            this.idInterval =
                window.setInterval(this.fnTick, +this.interval);

            this.enabled = true;

            return this;
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

                    options = item.options;
                    runtime = item.runtime;

                    if (!runtime.suspended) {
                        runtime.elapsed += this.interval;

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
        invoke: function () {
            this.fnTick();
            return this;
        },
        suspendAll: function () {
            this.suspendedAll = true;
            return this;
        },
        resumeAll: function () {
            this.suspendedAll = false;
            return this;
        },
        add: function (id, options) {
            // check repetition
            if (undefined !== this.items[id]) { return this; }

            // use default attributes if parameters are not defined
            options = options || {};
            _.defaults(options, {
                call: this.call,
                countdown: this.countdown
            });

            // push new item
            this.items[id] = {
                options: options,
                runtime: {
                    elapsed: this.elapsed,
                    suspended: this.suspended,
                    waitCallbacks: this.waitCallbacks
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
        hasId: function (id) {
            return (undefined !== this.items[id]);
        },
        wait: function (id, callback) {
            this.items[id].runtime.waitCallbacks.push(callback);
        },
        setOptions: function (id, options) {
            this.items[id].options = options;
            return this;
        },
        setRuntime: function (id, runtime) {
            this.items[id].runtime = runtime;
            return this;
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
        },
        clear: function () {
            this.items = {};
            return this;
        },
        close: function () {
            clearInterval(this.idInterval);

            this.clear();
        }
    });

    return Model;
});
