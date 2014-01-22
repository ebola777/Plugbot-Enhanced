define('Plugbot/utils/Countdown', [
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
                countdown: 0
            };
        },
        initialize: function () {
            this.parent = BaseTimer.prototype;
            this.parent.initialize.call(this);

            // extend parent defaults
            _.defaults(this.attributes, this.parent.defaults());
        },
        fnTick: function () {
            var i, items, isEmpty, id, item, options, runtime,
                interval = this.interval;

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

                        runtime.elapsed += interval;

                        // check to remove the id
                        if (runtime.elapsed >= options.countdown) {
                            if (_.isFunction(options.call)) {
                                options.call.apply(this);

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

            if (isEmpty && this.get('exitWhenNoCall')) {
                this.close();
            }
        },
        add: function (id, fn, options) {
            // check repetition
            if (undefined !== this.items[id]) { return this; }

            // use default attributes if parameters are not defined
            options = options || {};
            _.defaults(options, {
                call: fn,
                countdown: this.get('countdown')
            });

            // push new item
            this.items[id] = {
                options: options,
                runtime: {
                    suspended: false,
                    elapsed: 0,
                    waitCallbacks: []
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
        remove: function (id) {
            if (undefined === this.items[id]) { return this; }
            delete this.items[id];

            return this;
        },
        restart: function (id, fn, options) {
            if (undefined !== this.items[id]) {
                this.resetElapsed(id);
            } else {
                this.add(id, fn, options);
            }
        },
        wait: function (id, callback) {
            this.items[id].runtime.waitCallbacks.push(callback);
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
            this.items[id].options.call.apply(this);
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
