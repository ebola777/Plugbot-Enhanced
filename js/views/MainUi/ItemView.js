define('Plugbot/views/MainUi/ItemView', [
    'Plugbot/tmpls/MainUi/ItemView'
], function (MainUiItemViewTemplate) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Runtime
                 */
                template: undefined
            };
        },
        TEMPLATE: MainUiItemViewTemplate,
        initialize: function () {
            _.bindAll(this);
            _.defaults(this, this.defaults());

            // init template
            this.options.template = new this.TEMPLATE({view: this});

            // bind events
            this.listenTo(this.model, 'change:enabled', this.render2);
        },
        events: {
            'click': 'onClick'
        },
        render: function () {
            this.options.template.setSelf({
                id: this.model.get('id'),
                'class': this.getClass(this.model.get('enabled')),
                text: this.model.get('text')
            });

            return this;
        },
        render2: function () {
            this.$el.prop('class', this.getClass(this.model.get('enabled')));

            return this;
        },
        onClick: function () {
            this.model.set('enabled', !this.model.get('enabled'));
        },
        getClass: function (en) {
            return (en ? 'item-enabled' : 'item-disabled');
        },
        close: function () {
            this.remove();
        }
    });

    return View;
});
