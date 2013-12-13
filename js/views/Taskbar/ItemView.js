define('Plugbot/views/Taskbar/ItemView', [
    'Plugbot/events/Taskbar/ItemEvents',
    'Plugbot/tmpls/Taskbar/ItemView'
], function (TaskbarItemEvents, TaskbarItemTemplate) {
    'use strict';

    var View = Backbone.View.extend({
        events: {
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        initialize: function () {
            // runtime options
            this.dispatcher = TaskbarItemEvents.getDispatcher();
            this.template = new TaskbarItemTemplate({view: this});
        },
        render: function () {
            this.template.setSelf({
                title: this.model.get('title')
            });

            return this;
        },
        onMouseEnter: function () {
            this.dispatcher.dispatch('MOUSE_ENTER');
        },
        onMouseLeave: function () {
            this.dispatcher.dispatch('MOUSE_LEAVE');
        },
        close: function () {
            this.remove();
        }
    });

    return View;
});
