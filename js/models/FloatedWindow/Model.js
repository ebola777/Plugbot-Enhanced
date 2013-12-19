define('Plugbot/models/FloatedWindow/Model', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                /**
                 * Attributes
                 */
                name: undefined,
                bodyClass: '',
                tableLayout: undefined,
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
                zIndex: undefined,
                oldZIndex: undefined,
                resizable: false,
                draggable: false,
                /**
                 * Position
                 */
                x: 0,
                y: 0,
                oldX: 0,
                oldY: 0,
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
        }
    });

    return Model;
});
