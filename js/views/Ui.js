define('Plugbot/views/Ui', [], function () {
    'use strict';

    //region VARIABLES =====
    var plugdj = {
            /**
             * Elements
             */
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
            mainUi: '.plugbot-ui',
            userlist: '.plugbot-userlist'
        };

    //endregion

    return {
        // names
        plugdj: plugdj,
        plugbot: plugbot
    };
});
