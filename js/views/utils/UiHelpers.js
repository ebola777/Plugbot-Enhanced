define('Plugbot/views/utils/UiHelpers', [
    'Plugbot/utils/Watcher'
], function (Watcher) {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function getId(name) {
        var ret;

        if ('#' === name[0]) {
            ret = name.substr(1);
        } else {
            ret = null;
        }

        return ret;
    }

    function getClass(name) {
        var ret;

        if ('.' === name[0]) {
            ret = name.substr(1);
        } else {
            ret = null;
        }

        return ret;
    }

    function getBorder(elem, size) {
        var ret;

        switch (size) {
        case 'width':
            ret = elem.outerWidth() - elem.innerWidth();
            break;
        case 'height':
            ret = elem.outerHeight() - elem.innerHeight();
            break;
        case 'both':
            ret = {
                width: elem.outerWidth() - elem.innerWidth(),
                height: elem.outerHeight() - elem.innerHeight()
            };
            break;
        }

        return ret;
    }

    function getPadding(elem, size) {
        var ret;

        switch (size) {
        case 'width':
            ret = elem.innerWidth() - elem.width();
            break;
        case 'height':
            ret = elem.innerWidth() - elem.width();
            break;
        case 'both':
            ret = {
                width: elem.innerWidth() - elem.width(),
                height: elem.innerWidth() - elem.width()
            };
            break;
        }

        return ret;
    }

    function getMargin(elem, size) {
        var ret;

        switch (size) {
        case 'width':
            ret = elem.outerWidth(true) - elem.outerWidth();
            break;
        case 'height':
            ret = elem.outerHeight(true) - elem.outerWidth();
            break;
        case 'both':
            ret = {
                width: elem.outerWidth(true) - elem.outerWidth(),
                height: elem.outerHeight(true) - elem.outerWidth()
            };
            break;
        }

        return ret;
    }

    function getMinFloatSize(parent, size) {
        var i,
            child = parent.children(),
            min;

        switch (size) {
        case 'width':
            min = getPadding(parent, 'width');
            break;
        case 'height':
            min = getPadding(parent, 'height');
            break;
        case 'both':
            min = {
                width: getPadding(parent, 'width'),
                height: getPadding(parent, 'height')
            };
            break;
        }

        for (i = 0; i !== child.length; i += 1) {
            switch (size) {
            case 'width':
                min += child[i].outerWidth(true);
                break;
            case 'height':
                min += child[i].outerHeight(true);
                break;
            case 'both':
                min.width += child[i].outerWidth(true);
                min.height += child[i].outerHeight(true);
                break;
            }
        }

        return min;
    }

    function insertAt(jqElem, jqParent, ind) {
        var jqChildren = jqParent.children();

        if (jqChildren.length === ind) {
            jqParent.append(jqElem);
        } else {
            jqChildren.eq(ind).before(jqElem);
        }
    }

    function removeAt(jqParent, ind) {
        jqParent.children().eq(ind).remove();
    }

    function replaceAt(jqElem, jqParent, ind) {
        jqParent.children().eq(ind).replaceWith(jqElem);
    }

    /**
     * Fit child element to parent element
     * @param {Array.<Object{element}>} child   Child element
     * @param {Array.<Object{element}>} parent  Parent element
     * @param {string} size     'width', 'height' or 'both'
     * @param {number=} addW    Add width how much
     * @param {number=} addH    Add height how much
     */
    function fitElement(child, parent, size, addW, addH) {
        var outerW = child.outerWidth(true) - child.width(),
            outerH = child.outerHeight(true) - child.height();

        addW = addW || 0;
        addH = addH || 0;

        switch (size) {
        case 'width':
            child.width(parent.width() - outerW + addW);
            break;
        case 'height':
            child.height(parent.height() - outerH + addH);
            break;
        case 'both':
            child.width(parent.width() - outerW + addW);
            child.height(parent.height() - outerH + addH);
            break;
        }
    }

    function iframeFix(iframe) {
        var oriPointerEvents = iframe.css('pointer-events'),
            watcher = new Watcher(),
            fnFix = function (iframe) {
                if (0 === iframe.length) {
                    return 0;
                }

                iframe.css('pointer-events', 'none');
                return 1;
            };

        watcher.add('iframe-fix', fnFix, {
            args: [iframe]
        });

        fnFix(iframe);

        return {
            close: function () {
                _removeIframeFix(watcher, iframe, oriPointerEvents);
            }
        };
    }

    //endregion


    //region PRIVATE FUNCTIONS =====
    function _removeIframeFix(watcher, iframe, oriPointerEvents) {
        iframe.css('pointer-events', oriPointerEvents);
        watcher.close();
    }

    //endregion

    return {
        getId: getId,
        getClass: getClass,
        getBorder: getBorder,
        getPadding: getPadding,
        getMargin: getMargin,
        getMinFloatSize: getMinFloatSize,
        insertAt: insertAt,
        removeAt: removeAt,
        replaceAt: replaceAt,
        fitElement: fitElement,
        iframeFix: iframeFix
    };
});
