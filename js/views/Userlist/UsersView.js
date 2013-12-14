define('Plugbot/views/Userlist/UsersView', [
    'Plugbot/base/SubView',
    'Plugbot/colls/Userlist/ItemCollection',
    'Plugbot/models/Userlist/UsersModel',
    'Plugbot/views/Userlist/UsersItemView',
    'Plugbot/views/utils/Ui',
    'Plugbot/views/utils/UiHelpers'
], function (BaseSubView, UserlistItemCollection, UserlistUsersModel,
             UsersItemView, Ui, UiHelpers) {
    'use strict';

    var View = BaseSubView.extend({
        initialize: function () {
            // set parent
            this.parent = BaseSubView.prototype;
            this.parent.initialize.call(this);

            // set model
            this.model = new UserlistUsersModel();

            // set collection
            this.collection = new UserlistItemCollection();

            // collection events
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'remove', this.removeOne);
            this.listenTo(this.collection, 'change:curated change:vote',
                this.changeOne);
        },
        renderFromParent: function () {
            this.updateData();
        },
        updateData: function () {
            this.model.update();
            this.collection.set(this.model.get('users'));
        },
        addOne: function (mod) {
            var ind = this.collection.indexOf(mod),
                newView = new UsersItemView({
                    model: mod
                });

            UiHelpers.insertAt(newView.render().$el, this.$el, ind);
            this.setSubView(mod.get('id'), newView);
        },
        removeOne: function (mod, coll, options) {
            UiHelpers.removeAt(this.$el, options.index);
            this.closeSubView(mod.get('id'));
        },
        changeOne: function (mod) {
            var ind = this.collection.indexOf(mod),
                view = this.getSubView(mod.get('id'));

            view.model.set({
                vote: mod.get('vote'),
                curated: mod.get('curated')
            });

            UiHelpers.replaceAt(view.render().$el, this.$el, ind);
        },
        close: function () {
            // remove collection
            this.collection.reset();

            // remove sub-views
            this.closeAllSubViews();

            this.remove();
        }
    });

    return View;
});
