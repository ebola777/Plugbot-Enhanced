define('Plugbot/base/Timer', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                /**
                 * Default, read-only
                 */
                interval: 'optimal',
                optimalHz: 12,
                autoStart: true,
                exitWhenNoCall: false
            };
        },
        initialize: function () {
            _.bindAll(this, 'fnTick');

            // runtime options
            this.enabled = false;
            this.interval = undefined;
            this.items = {};
            this.idInterval = undefined;
            this.suspendedAll = false;
        },
        start: function () {
            var interval = this.get('interval');

            // set interval
            if (!_.isNumber(interval)) {
                if ('optimal' === interval) {
                    interval = Math.round(1000 / this.get('optimalHz'));
                } else if ('hz' === interval.substr(-2)) {
                    interval = Math.round(1000 /
                        +interval.substr(0, interval.length - 2));
                }
            }

            this.interval = interval;

            // start
            this.idInterval = setInterval(this.fnTick, interval);
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
            this.idInterval = null;

            this.clear();
        }
    });

    return Model;
});
