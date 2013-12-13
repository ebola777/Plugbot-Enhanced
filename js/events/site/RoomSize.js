define('Plugbot/events/site/RoomSize', [
    'Plugbot/views/utils/Ui'
], function (Ui) {
    'use strict';

    //region VARIABLES =====
    var uiRoom = Ui.plugdj.$room,
        lastRoomSize;

    //endregion


    //region PUBLIC FUNCTIONS =====
    function getCurrentRoomSize() {
        return {
            width: uiRoom.width(),
            height: uiRoom.height()
        };
    }

    function getLastRoomSize() {
        if (undefined === lastRoomSize) {
            lastRoomSize = getCurrentRoomSize();
        }

        return lastRoomSize;
    }

    function getRatio() {
        var currentRoomSize = getCurrentRoomSize(),
            _lastRoomSize = getLastRoomSize();

        return {
            width: currentRoomSize.width / _lastRoomSize.width,
            height: currentRoomSize.height / _lastRoomSize.height
        };
    }

    function setLastRoomSize(size) {
        lastRoomSize = size;
    }

    //endregion

    return {
        getCurrentRoomSize: getCurrentRoomSize,
        getLastRoomSize: getLastRoomSize,
        getRatio: getRatio,
        setLastRoomSize: setLastRoomSize
    };
});
