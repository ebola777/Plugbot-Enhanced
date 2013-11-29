define('Plugbot/views/Userlist/UsersView', [
    'Plugbot/models/Userlist/ItemCollection',
    'Plugbot/views/Userlist/UsersItemView',
    'Plugbot/views/utils/Ui'
], function (UserlistItemCollection, UsersItemView, Ui) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Runtime
                 */
                views: {}
            };
        },
        initialize: function () {
            _.bindAll(this);

            _.defaults(this.options, this.defaults());

            // set model collection
            this.collection = new UserlistItemCollection();

            // render
            this.render();
        },
        events: {
            'click .userlist-item': 'onClick'
        },
        render: function () {
            var i,
                users = this.model.get('users'),
                user,
                models,
                model,
                newView;

            // reset
            this.removeViews();
            this.collection.reset();

            // add models to collection
            for (i = 0; i < users.length; i += 1) {
                user = users[i];
                this.collection.add({
                    id: user.id,
                    user: user
                });
            }

            // render
            models = this.collection.models;
            for (i = 0; i !== models.length; i += 1) {
                model = models[i];
                newView = new UsersItemView({
                    model: model
                });

                this.$el.append(newView.render().$el);
                this.options.views[model.get('id')] = newView;
            }
        },
        onClick: function (e) {
            var id = $(e.currentTarget).data('id'),
                model = this.collection.get(id),
                user = model.get('user');

            // mention
            $(Ui.plugdj.chatInputField)
                .val('@' + user.username + ' ')
                .focus();
        },
        removeViews: function () {
            var key, views = this.options.views;

            for (key in views) {
                if (views.hasOwnProperty(key)) {
                    views[key].close();
                }
            }
        },
        close: function () {
            var key;

            this.remove();

            // remove collection
            this.collection.reset();

            // remove views
            for (key in this.views) {
                if (this.views.hasOwnProperty(key)) {
                    this.views[key].close();
                }
            }
        }
    });

    return View;
});
