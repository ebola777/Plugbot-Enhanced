define('Plugbot/base/Timer', [], function () {
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
        },
        start: function () {
            var interval = this.interval;

            // set interval
            if (interval === 'optimal') {
                interval = Math.round(1000 / this.optimalHz);
            } else if (this.interval.substr(-2) === 'hz') {
                interval = Math.round(1000 /
                    +interval.substr(0, interval.length - 2));
            }

            this.interval = interval;

            // start
            this.idInterval = window.setInterval(this.fnTick, interval);
            this.enabled = true;

            return this;
        },
        fnTick: undefined,
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
        has: function (id) {
            return (undefined !== this.items[id]);
        },
        setOptions: function (id, options) {
            this.items[id].options = options;
            return this;
        },
        setRuntime: function (id, runtime) {
            this.items[id].runtime = runtime;
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
