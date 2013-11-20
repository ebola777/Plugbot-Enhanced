define('Plugbot/events/SiteEvents', [
    'Plugbot/events/BaseEvents'
], function (BaseEvents) {
    'use strict';

    //region VARIABLES =====
        // dispatcher
    var dispatcher = {
            RESIZE: 'resize'
        };

    //endregion


    //region CONTRUCTORS =====
    (function () {
        _.extend(dispatcher, BaseEvents);
    }());

    //endregion


    //region PUBLIC FUNCTIONS =====
    function initDispatcher() {
        $(window).on('resize', onWindowResize);
    }

    function removeDispatcher() {
        $(window).off('resize', onWindowResize);
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    function onWindowResize(e) {
        dispatcher.dispatch('RESIZE', [e]);
    }

    //endregion

    return {
        initDispatcher: initDispatcher,
        removeDispatcher: removeDispatcher,
        dispatcher: dispatcher
    };
});
