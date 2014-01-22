define('Plugbot/views/utils/Ui', [], function () {
    'use strict';

    //region VARIABLES =====
    var plugdj = {
            /**
             * Elements
             */
            window: window,
            body: document.body,
            header: '#header',
            room: '#room',
            playback: '#playback',
            playlistPanel: '#playlist-panel',
            dialogPreview: '#dialog-preview',
            chatInputField: '#chat-input-field',
            woot: '#woot'
        },
        omitCachePlugdj = [
            'dialogPreview'
        ],
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
        _cachePlugDjElements();
    }());

    //endregion


    //region PRIVATE FUNCTIONS =====
    function _cachePlugDjElements() {
        var key,
            listFilterd = _.omit(plugdj, omitCachePlugdj);

        for (key in listFilterd) {
            if (listFilterd.hasOwnProperty(key)) {
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
