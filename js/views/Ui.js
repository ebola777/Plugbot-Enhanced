define('Plugbot/views/Ui', [
    'app/utils/Layout'
], function (AppLayout) {
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
            woot: '#woot',
            /**
             * Layout
             */
            LAYOUT: {
                BAR_HEIGHT: AppLayout.BAR_HEIGHT
            }
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
