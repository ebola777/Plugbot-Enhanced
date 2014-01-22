define('Plugbot/events/MainUi/Events', [
    'Plugbot/base/Events'
], function (BaseEvents) {
    'use strict';

    //region VARIABLES =====
    var events = {
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
