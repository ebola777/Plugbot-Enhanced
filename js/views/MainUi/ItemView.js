define('Plugbot/views/MainUi/ItemView', [
    'handlebars'
], function (Handlebars) {
    'use strict';

    var View = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this);

            // bind events
            this.listenTo(this.model, 'change:enabled', this.render2);
        },
        events: {
            'click': 'onClick'
        },
        template: Handlebars.compile(
            '<p id="{{id}}" class="{{class}}">{{text}}<\/p>'
        ),
        render: function () {
            this.setElement(this.template({
                id: this.model.get('id'),
                'class': this.getClass(this.model.get('enabled')),
                text: this.model.get('text')
            }));

            return this;
        },
        render2: function () {
            this.$el.prop('class',
                this.getClass(this.model.get('enabled')));

            return this;
        },
        getClass: function (enalbed) {
            return (enalbed ? 'item-enabled' : 'item-disabled');
        },
        onClick: function () {
            this.model.set('enabled', !this.model.get('enabled'));
        },
        close: function () {
            this.remove();
        }
    });

    return View;
});
