define('Plugbot/utils/API', [], function () {
    'use strict';

    //region VARIABELS =====
    var PLAYBACK = {
            VOLUME: {
                MUTE: 0,
                MIN: 0,
                MAX: 100
            }
        },
        USER = {
            VOTE: {
                WOOT: 1,
                UNDECIDED: 0,
                MEH: -1
            }
        };

    //endregion

    return {
        // variables
        PLAYBACK: PLAYBACK,
        USER: USER
    };
});
