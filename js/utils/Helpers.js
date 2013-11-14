define('Plugbot/utils/Helpers', [
    'handlebars'
], function (Handlebars) {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function initHandlebarsHelpers() {
        // get name of jquery id or class
        Handlebars.registerHelper('getName', function (jqName) {
            return jqName.substr(1);
        });
    }

    function removeHandlebarsHelpers() {
        delete Handlebars.helpers.getName;
    }

    /**
     * Set binding to single object
     * @param {Object} ref      Reference object
     * @param {Object} obj      Object
     * @param {Function|undefined} callback     Callback function with
     *      arguments (obj, key, value)
     */
    function setBinding(ref, obj, callback) {
        var key, value;

        for (key in ref) {
            if (ref.hasOwnProperty(key)) {
                value = ref[key];

                if (Object !== value.constructor) {
                    if (undefined === callback) {
                        obj[key] = value;
                    } else {
                        callback(obj, key, value);
                    }
                } else {
                    setBinding(value, obj[key], callback);
                }
            }
        }
    }

    /**
     * Set binding from object to object
     * ex. a = {'abc': 'xyz'}
     *     src = {'abc': 3}
     *     dst = {'xyz': -1}
     *     call (a, src, dst)
     *     JSON.stringify(dst) === JSON.stringify({'xyz': 3})
     * @param {Object} ref          Reference object
     * @param {Object} src          Source object
     * @param {Object} dst          Destination object
     * @param {String|undefined} delim        Delimeter
     * @param {Function|undefined} callback   Callback function to handle
     *      setting the value with arguments (pairSrc, pairDst), each pair
     *      has the type of {obj: Object, key: String}
     */
    function setBindingObjToObj(ref, src, dst, delim, callback) {
        var key, value;

        for (key in ref) {
            if (ref.hasOwnProperty(key)) {
                value = ref[key];

                if (Object !== value.constructor) {
                    applyBindingObjToObj(src, dst, key, value,
                        delim, callback);
                } else {
                    setBindingObjToObj(value, src[key], dst[key],
                        delim, callback);
                }
            }
        }
    }

    /**
     * Set binding by a proxy object
     * ex. src = {'key1': 0, 'key2': 1, 'key3': 2}
     *     proxy = {'key1': 'foo', 'key2': 'bar', 'key3': 'obj.item1'}
     *     target = {'foo': -1, 'bar': -1, obj: {'item1': -1} }
     *     call (src, proxy, target, '.')
     *     JSON.stringify(target) ===
     *         JSON.stringify({'foo': 0, 'bar': 1, obj: {'item1': 2} })
     * @param {Object} src                  Source object
     * @param {Object} proxy                Proxy object
     * @param {Object} dst                  Destination object
     * @param {String|undefined} delim      Delimeter in destination
     *      object value
     * @param {Function|undefined} callback     Callback function to handle
     *      setting the value with arguments (src, target, dstKey)
     */
    function setBindingByProxy(src, proxy, dst, delim, callback) {
        if (Object !== src.constructor) {
            applyBindingByProxy(src, proxy, dst, delim, callback);
            return;
        }

        var key;

        for (key in src) {
            if (src.hasOwnProperty(key)) {
                setBindingByProxy(src[key], proxy[key], dst, delim,
                    callback);
            }
        }
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    function applyBindingByProxy(src, proxy, dst, delim, callback) {
        var i,
            chain = proxy.split(delim),
            prop = dst;

        for (i = 0; i < chain.length - 1; i += 1) {
            prop = prop[chain[i]];
        }

        if (undefined === callback) {
            prop[chain[i]] = src;
        } else {
            callback(src, prop, chain[i]);
        }
    }

    function applyBindingObjToObj(src, dst, keySrc, valueDst, delim,
                                  callback) {
        var pairSrc = getBindingLastPair(src, keySrc, delim),
            pairDst = getBindingLastPair(dst, valueDst, delim);

        if (undefined === callback) {
            pairDst.obj[pairDst.key] = pairSrc.obj[pairSrc.key];
        } else {
            callback(pairSrc, pairDst);
        }
    }

    /**
     * ex. obj = {'level1': {'level2': 3}}
     *     str = 'level1.level2'
     *     delim = '.'
     *     call (obj, str, delim)
     *     JSON.stringify(getBindingLastPair(obj, str, delim)) ===
     *         JSON.stringify({obj: obj.level1, key: 'level2'})
     * @param {Object} obj      Object to be searched
     * @param {String} str      Structure string
     * @param {String} delim    Delimeter for seperating str
     * @return {{obj: Object, key: String}}
     */
    function getBindingLastPair(obj, str, delim) {
        var i,
            chain = str.split(delim),
            prop = obj;

        for (i = 0; i < chain.length - 1; i += 1) {
            prop = prop[chain[i]];
        }

        return {
            obj: prop,
            key: chain[i]
        };
    }

    //endregion

    return {
        initHandlebarsHelpers: initHandlebarsHelpers,
        removeHandlebarsHelpers: removeHandlebarsHelpers,
        setBinding: setBinding,
        setBindingObjToObj: setBindingObjToObj,
        setBindingByProxy: setBindingByProxy
    };
});
