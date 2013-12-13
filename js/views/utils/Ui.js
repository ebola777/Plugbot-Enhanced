define('Plugbot/views/utils/Ui', [], function () {
    'use strict';

    //region VARIABLES =====
    var plugdj = {
            /**
             * Elements
             */
            window: window,
            document: document,
            header: '#header',
            room: '#room',
            playback: '#playback',
            playlistPanel: '#playlist-panel',
            chatInputField: '#chat-input-field',
            woot: '#woot'
        },
        plugbot = {
            /**
             * Elements
             */
            mainUi: '.plugbot-main-ui',
            userlist: '.plugbot-userlist'
        };

    //endregion


    //region INIT =====
    (function () {
        // cache plugdj elements
        cachePlugDjElements();
    }());

    //endregion


    //region PRIVATE FUNCTIONS =====
    function cachePlugDjElements() {
        var key;

        for (key in plugdj) {
            if (plugdj.hasOwnProperty(key)) {
                plugdj['$' + key] = $(plugdj[key]);
            }
        }
    }

    //endregion

    return {
        // variables
        plugdj: plugdj,
        plugbot: plugbot
    };
});
