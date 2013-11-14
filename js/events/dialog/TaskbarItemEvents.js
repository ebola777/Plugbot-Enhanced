define('Plugbot/events/dialog/TaskbarItemEvents', [
    'Plugbot/events/BaseEvents'
], function (BaseEvents) {
    'use strict';

    //region VARIABLES =====
    var Events = {
        MOUSE_ENTER: 'mouse-enter',
        MOUSE_LEAVE: 'mouse-leave'
    };

    //endregion


    //region CONSTRUCTORS =====
    (function () {
        _.extend(Events, BaseEvents);
    }());

    //endregion

    return Events;
});
