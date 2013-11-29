define('Plugbot/events/SiteEvents', [
    'Plugbot/base/Events'
], function (BaseEvents) {
    'use strict';

    //region VARIABLES =====
        // dispatcher
    var dispatcher = {
            RESIZE: 'resize'
        };

    //endregion


    //region INIT =====
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
        // variables
        dispatcher: dispatcher,
        // functions
        initDispatcher: initDispatcher,
        removeDispatcher: removeDispatcher
    };
});
