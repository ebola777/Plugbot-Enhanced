define('Plugbot/views/dialog/TaskbarItemView', [
    'handlebars',
    'Plugbot/events/dialog/TaskbarItemEvents'
], function (Handlebars, TaskbarItemEvents) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Options
                 */
                dispatcher: _.clone(TaskbarItemEvents)
            };
        },
        events: {
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        initialize: function () {
            _.bindAll(this);

            // pull defaults to options
            _.defaults(this.options, this.defaults());
        },
        template: Handlebars.compile(
            '    <li class="task">{{title}}<\/li>'
        ),
        render: function () {
            this.setElement(this.template({
                title: this.model.get('title')
            }));

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
