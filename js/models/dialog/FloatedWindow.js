define('Plugbot/models/dialog/FloatedWindow', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                /**
                 * Attributes
                 */
                name: undefined,
                bodyClass: '',
                status: 'normal',
                /**
                 * View
                 */
                view: undefined,
                /**
                 * Layout
                 */
                visible: true,
                narrowAction: 'hidden',
                title: 'Untitled',
                callsign: 'AAA',
                zIndex: 0,
                resizable: false,
                draggable: false,
                /**
                 * Position
                 */
                x: 0,
                y: 0,
                /**
                 * Size
                 */
                width: 'auto',
                height: 'auto',
                minWidth: 0,
                maxWidth: 0,
                minHeight: 0,
                maxHeight: 0,
                /**
                 * Header box
                 */
                minimizeBox: false,
                restireBox: false,
                closeBox: false
            };
        },
        NarrowActions: {
            none: 0,
            hidden: 1,
            callsign: 2,
            expanded: 3
        },
        Status: {
            hidden: 0,
            minimized: 1,
            normal: 2
        }
    });

    return Model;
});
