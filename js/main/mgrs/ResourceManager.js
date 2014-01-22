define('Plugbot/main/mgrs/ResourceManager', [], function () {
    'use strict';

    //region CONSTANTS =====
    var FUNC_NAME_CLOSE = 'close',

    //endregion


    //region VARIABLES =====
        resources = {};

    //endregion


    //region PUBLIC FUNCTIONS =====
    function getResources(key) {
        var ret;

        if (undefined !== key) {
            ret = _getResourceOne(key);
        } else {
            ret = _getResources();
        }

        return ret;
    }

    function setResources(keys, obj) {
        if (!_.isObject(keys)) {
            _setResourceOne(keys, obj);
        } else {
            _setResources(keys);
        }
    }

    function close(key) {
        if (undefined === key) {
            _closeAll();
        } else {
            _closeOne(resources[key]);
        }
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    function _getResourceOne(key) {
        return resources[key];
    }

    function _getResources() {
        return resources;
    }

    function _setResourceOne(key, obj) {
        resources[key] = obj;
    }

    function _setResources(pairs) {
        var key;

        for (key in pairs) {
            if (pairs.hasOwnProperty(key)) {
                resources[key] = pairs[key];
            }
        }
    }

    function _closeOne(obj) {
        var fnClose;

        if (undefined !== obj) {
            fnClose = obj[FUNC_NAME_CLOSE];

            if (_.isFunction(fnClose)) {
                obj[FUNC_NAME_CLOSE]();
            }
        }
    }

    function _closeAll() {
        var key;

        for (key in resources) {
            if (resources.hasOwnProperty(key)) {
                _closeOne(resources[key]);
            }
        }
    }

    //endregion

    return {
        get: getResources,
        set: setResources,
        close: close
    };
});
