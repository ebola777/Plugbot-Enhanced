define('Plugbot/utils/Helpers', [], function () {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function defaultsDeep(src, dst) {
        var key;

        for (key in src) {
            if (src.hasOwnProperty(key)) {
                if (dst.hasOwnProperty(key)) {
                    defaultsDeep(src[key], dst[key]);
                } else {
                    dst[key] = src[key];
                }
            }
        }
    }

    function extendDeep(src, dst) {
        var key, valSrc, valDst;

        for (key in src) {
            if (src.hasOwnProperty(key)) {
                valSrc = src[key];

                if (dst.hasOwnProperty(key)) {
                    valDst = dst[key];

                    if ('object' !== typeof valSrc ||
                            'object' !== typeof valDst) {
                        dst[key] = valSrc;
                    } else {
                        extendDeep(valSrc, valDst);
                    }
                } else {
                    dst[key] = valSrc;
                }
            }
        }
    }

    function applyDeep(src, dst) {
        var key, valSrc, valDst;

        for (key in src) {
            if (src.hasOwnProperty(key)) {
                valSrc = src[key];

                if (dst.hasOwnProperty(key)) {
                    valDst = dst[key];

                    if ('object' !== typeof valSrc ||
                            'object' !== typeof valDst) {
                        dst[key] = valSrc;
                    } else {
                        applyDeep(valSrc, valDst);
                    }
                }
            }
        }
    }

    function cloneDeep(src) {
        return JSON.parse(JSON.stringify(src));
    }

    //endregion


    return {
        defaultsDeep: defaultsDeep,
        extendDeep: extendDeep,
        applyDeep: applyDeep,
        cloneDeep: cloneDeep
    };
});
