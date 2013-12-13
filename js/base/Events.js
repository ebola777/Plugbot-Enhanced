define('Plugbot/base/Events', [], function () {
    'use strict';

    //region VARIABLES =====
    var events = {
        dispatch: function (event, options) {
            var eventItem = this[event];

            if (undefined !== eventItem) {
                this.trigger(this[event], options);
            } else {
                throw new Error('Cannot find event "' + event + '".');
            }

            return this;
        }
    };

    //endregion


    //region INIT =====
    (function () {
        _.extend(events, Backbone.Events);
    }());

    //endregion

    return events;
});
