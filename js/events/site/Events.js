define('Plugbot/events/site/Events', [
    'Plugbot/base/Events',
    'Plugbot/events/site/RoomSize',
    'Plugbot/views/utils/Ui'
], function (BaseEvents, RoomSize, Ui) {
    'use strict';

    //region VARIABLES =====
    var events = {
            RESIZE: 'resize'
        };
    //endregion


    //region INIT =====
    (function () {
        _.extend(events, BaseEvents);
    }());

    //endregion


    //region PUBLIC FUNCTIONS =====
    function getDispatcher() {
        return events;
    }

    function initDispatcher() {
        // init modules
        RoomSize.getLastRoomSize();

        // bind events
        Ui.plugdj.$window.on('resize', onWindowResize);
    }

    function removeDispatcher() {
        // unbind events
        Ui.plugdj.$window.off('resize', onWindowResize);
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    function onWindowResize(e) {
        var lastRoomSize = RoomSize.getLastRoomSize(),
            currentRoomSize = RoomSize.getCurrentRoomSize(),
            ratio = RoomSize.getRatio();

        events.dispatch('RESIZE', {
            e: e,
            lastRoomSize: lastRoomSize,
            currentRoomSize: currentRoomSize,
            ratio: ratio
        });

        RoomSize.setLastRoomSize(currentRoomSize);
    }

    //endregion

    return {
        getDispatcher: getDispatcher,
        initDispatcher: initDispatcher,
        removeDispatcher: removeDispatcher
    };
});
