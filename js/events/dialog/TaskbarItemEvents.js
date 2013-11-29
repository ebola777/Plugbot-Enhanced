define('Plugbot/events/dialog/TaskbarItemEvents', [
    'Plugbot/base/Events'
], function (BaseEvents) {
    'use strict';

    //region VARIABLES =====
    var events = {
        MOUSE_ENTER: 'mouse-enter',
        MOUSE_LEAVE: 'mouse-leave'
    };

    //endregion


    //region INIT =====
    (function () {
        _.extend(events, BaseEvents);
    }());

    //endregion

    return events;
});
