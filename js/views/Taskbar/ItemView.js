define('Plugbot/views/Taskbar/ItemView', [
    'Plugbot/events/Taskbar/ItemEvents',
    'Plugbot/tmpls/Taskbar/ItemView'
], function (TaskbarItemEvents, TaskbarItemViewTemplate) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Options
                 */
                dispatcher: _.clone(TaskbarItemEvents),
                /**
                 * Runtime
                 */
                template: undefined
            };
        },
        events: {
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        TEMPLATE: TaskbarItemViewTemplate,
        initialize: function () {
            _.bindAll(this);
            _.defaults(this.options, this.defaults());

            // init template
            this.options.template = new this.TEMPLATE({view: this});
        },
        render: function () {
            this.options.template.setSelf({
                title: this.model.get('title')
            });

            return this;
        },
        onMouseEnter: function () {
            this.options.dispatcher.dispatch('MOUSE_ENTER', {
                model: this.model
            });
        },
        onMouseLeave: function () {
            this.options.dispatcher.dispatch('MOUSE_LEAVE', {
                model: this.model
            });
        },
        close: function () {
            this.remove();
        }
    });

    return View;
});
