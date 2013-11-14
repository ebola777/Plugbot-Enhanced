define('Plugbot/events/SiteEvents', [], function () {
    'use strict';

    //region VARIABLES =====
        // dispatcher
    var dispatcher = {
            LAYOUT: {
                RESIZE: 'layout:resize'
            }
        };

    //endregion


    // region PUBLIC FUNCTIONS =====
    function initDispatcher() {
        _.extend(dispatcher, Backbone.Events);

        require([
            'app/utils/Layout'
        ], function (
            Layout
        ) {
            dispatcher.listenTo(Layout, 'resize', function (e) {
                dispatcher.trigger(dispatcher.LAYOUT.RESIZE, e);
            });
        });
    }

    function removeDispatcher() {
        dispatcher.stopListening();
    }

    //endregion

    return {
        initDispatcher: initDispatcher,
        removeDispatcher: removeDispatcher,
        dispatcher: dispatcher
    };
});
