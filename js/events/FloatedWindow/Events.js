define('Plugbot/events/FloatedWindow/Events', [
    'Plugbot/base/Events'
], function (BaseEvents) {
    'use strict';

    //region VARIABLES =====
    var events = {
        AFTER_RENDER: 'after:render',
        SHOW: 'show',
        HIDE: 'hide',
        RESIZE_START: 'resize:start',
        RESIZE_NOW: 'resize:now',
        RESIZE_STOP: 'resize:stop',
        DRAG_START: 'drag:start',
        DRAG_NOW: 'drag:now',
        DRAG_STOP: 'drag:stop',
        CONTROLBOX_MINIMIZE: 'control-box:minimize',
        CONTROLBOX_MAXIMIZE: 'control-box:maximize',
        CONTROLBOX_CLOSE: 'control-box:close',
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
