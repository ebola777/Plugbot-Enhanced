define('Plugbot/events/BaseEvents', [], function () {
    'use strict';

    //region VARIABLES =====
    var Events = {
        dispatch: function (event, options) {
            var eventItem = this[event];

            if (undefined !== eventItem) {
                this.trigger(this[event], options);
            } else {
                throw 'Cannot find event "' + event + '".';
            }
        }
    };

    //endregion


    //region CONSTRUCTORS =====
    (function () {
        _.extend(Events, Backbone.Events);
    }());

    //endregion

    return Events;
});
