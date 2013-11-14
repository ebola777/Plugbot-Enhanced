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

    function insertAt(elem, parent, ind) {
        if (0 === ind) {
            parent.prepend(elem);
        } else {
            parent.children().eq(ind - 1).after(elem);
        }
    }

    /**
     * Fit child element to parent element
     * @param {Array} child         Child element
     * @param {Array} parent        Parent element
     * @param {String} size         width, height, both
     * @param {undefined|Number} addW         Add width how much
     * @param {undefined|Number} addH         Add height how much
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

    function detach(elem) {
        var nextSibling,
            parent = null;

        nextSibling = elem.next();
        if (0 === nextSibling.length) {
            parent = elem.parent();
        }

        elem = elem.detach();

        return {
            elem: elem,
            nextSibling: nextSibling,
            parent: parent
        };
    }

    function reattach(obj) {
        if (null === obj.parent) {
            obj.nextSibling.before(obj.elem);
        } else {
            obj.parent.append(obj.elem);
        }
    }

    function autoResize(elem, parent) {
        var attr = {
                ori: {},
                now: {}
            },
            updateAttr = function (key) {
                attr[key] = {
                    pos: elem.position(),
                    size: {
                        width: elem.width(),
                        height: elem.height()
                    },
                    parentSize: {
                        width: parent.width(),
                        height: parent.height()
                    }
                };
            },
            watcher = new Watcher(),
            fnCheck = function () {
                var pos,
                    size,
                    parentSize,
                    newParentSize;

                // check if element is removed
                if (0 === parent.parent().length) {
                    watcher.close();
                    return 0;
                }

                // check if element has been rendered
                if (0 === elem.length) {
                    return 1;
                }

                // get layout info before modifing
                pos = elem.position();
                size = {
                    width: elem.width(),
                    height: elem.height()
                };
                parentSize = {
                    width: parent.width(),
                    height: parent.height()
                };

                // X
                if (pos.left !== attr.now.pos.left ||
                        parentSize.width !== attr.now.parentSize.width) {
                    // update element width
                    elem.width(attr.ori.size.width +
                        attr.ori.pos.left - pos.left +
                        parentSize.width - attr.ori.parentSize.width);
                }

                // Y
                if (pos.top !== attr.now.pos.top ||
                        parentSize.height !== attr.now.parentSize.height) {
                    // update element height
                    elem.height(attr.ori.size.height +
                        attr.ori.pos.top - pos.top +
                        parentSize.height - attr.ori.parentSize.height);
                }

                // check parent size in case it is being enlarged by the
                // element
                newParentSize = {
                    width: parent.width(),
                    height: parent.height()
                };

                if (newParentSize.width !== parentSize.width ||
                        newParentSize.height !== parentSize.height) {
                    elem.width(size.width);
                    elem.height(size.height);
                }

                // store attributes
                attr.now = {
                    pos: pos,
                    size: size,
                    parentSize: parentSize
                };

                return 1;
            };

        updateAttr('ori');
        updateAttr('now');

        watcher.add(fnCheck);

        return watcher;
    }

    function removeAutoResize(obj) {
        obj.invoke();
        obj.close();
    }

    function iframeFix(iframe) {
        var oriPointerEvents = iframe.css('pointer-events'),
            watcher = new Watcher(),
            fix = function (iframe) {
                if (0 === iframe.length) {
                    return 0;
                }

                iframe.css('pointer-events', 'none');
                return 1;
            };

        watcher.add(fix, {
            args: iframe
        });

        fix(iframe);

        return {
            watcher: watcher,
            iframe: iframe,
            oriPointerEvents: oriPointerEvents
        };
    }

    function removeIframeFix(obj) {
        obj.iframe.css('pointer-events', obj.oriPointerEvents);
        obj.watcher.close();
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
        fitElement: fitElement,
        detach: detach,
        reattach: reattach,
        autoResize: autoResize,
        removeAutoResize: removeAutoResize,
        iframeFix: iframeFix,
        removeIframeFix: removeIframeFix
    };
});
