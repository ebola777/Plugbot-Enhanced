define('Plugbot/events/Taskbar/ItemEvents', [
    'Plugbot/base/Events'
], function (BaseEvents) {
    'use strict';

    //region VARIABLES =====
    var events = {
        MOUSE_ENTER: 'mouse-enter',
        MOUSE_LEAVE: 'mouse-leave'
    };

    //endregion


    //region PUBLIC FUNCTIONS =====
    function getDispatcher(old) {
        return _.defaults(_.clone(events), old);
    }

    //endregion


    //region INIT =====
    (function () {
        _.extend(events, BaseEvents);
    }());

    //endregion

    return {
        getDispatcher: getDispatcher
    };
});
