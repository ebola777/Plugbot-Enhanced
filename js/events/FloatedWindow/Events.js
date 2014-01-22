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
        CONTROLBOX_RESTORE: 'control-box:restore',
        CONTROLBOX_CLOSE: 'control-box:close',
        MOUSE_ENTER: 'mouse-enter',
        MOUSE_LEAVE: 'mouse-leave',
        CHANGE_POS: 'change:pos',
        CHANGE_SIZE: 'change:size',
        CHANGE_SETTINGS: 'change:settings'
    };

    //endregion


    //region PUBLIC FUNCTIONS =====
    function getDispatcher() {
        return _.clone(events);
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
