define('Plugbot/views/Userlist/UsersView', [
    'Plugbot/base/SubView',
    'Plugbot/colls/Userlist/ItemCollection',
    'Plugbot/models/Userlist/UsersModel',
    'Plugbot/utils/Countdown',
    'Plugbot/views/Userlist/UsersItemView',
    'Plugbot/views/utils/UiHelpers'
], function (BaseSubView, ItemCollection, UsersModel, Countdown, UsersItemView,
             UiHelpers) {
    'use strict';

    var View = BaseSubView.extend({
        COUNTDOWN_IDS: {
            USERS_ERROR: 'users-error'
        },
        COUNTDOWN_USERS_ERROR: 10000,
        initialize: function () {
            // set parent
            this.parent = BaseSubView.prototype;
            this.parent.initialize.call(this);

            // runtime options
            this.countdownError = new Countdown();
            this.firstUpdateData = true;

            // set model
            this.model = new UsersModel();

            // set collection
            this.collection = new ItemCollection();

            // collection events
            this
                .listenTo(this.collection, 'add', this.addOne)
                .listenTo(this.collection, 'remove', this.removeOne)
                .listenTo(this.collection,
                    'change:vote change:curated change:username',
                    this.changeOne);
        },
        updateData: function () {
            this.model.update();
            this.collection.set(this.model.get('users'));

            this.firstUpdateData = false;
        },
        renderFromParent: function () {
            this.$el.hide();
            this.updateData();
            this.$el.show();
        },
        /**
         * Bad fix
         */
        render: function () {
            this.collection.reset();
            this.closeAllSubViews();
            this.$el.empty();

            this.firstUpdateData = true;
            this.$el.hide();
            this.updateData();
            this.$el.show();
        },
        addOne: function (mod, coll) {
            var that = this,
                ind = coll.indexOf(mod),
                newView = new UsersItemView({
                    model: mod
                });

            this.setSubView(mod.get('id'), newView);

            _.defer(function () {
                UiHelpers.insertAt(newView.$el, that.$el, ind);
            });

            this.verify();
        },
        removeOne: function (mod) {
            this.closeSubView(mod.get('id'));

            this.verify();
        },
        changeOne: function (mod) {
            var ind = this.collection.indexOf(mod),
                view = this.getSubView(mod.get('id'));

            view.model.set({
                vote: mod.get('vote'),
                curated: mod.get('curated'),
                username: mod.get('username')
            });

            view.render();
            UiHelpers.replaceAt(view.$el, this.$el, ind);
        },
        /**
         * A bad fix for an unknown bug, Backbone events sometimes don't fire
         */
        verify: function () {
            if (this.firstUpdateData) { return; }

            var that = this,
                i,
                models = this.collection.models,
                elems = this.$el.children(),
                isError = false,
                fnRender = function () {
//                    console.debug('RENDER!!!');
                    that.render();
                };

            for (i = 0; i < models.length; i += 1) {
                if ($(elems[i]).text() !== models[i].get('username')) {
                    isError = true;
                    this.countdownError.add(this.COUNTDOWN_IDS.USERS_ERROR,
                        fnRender, {
                            countdown: this.COUNTDOWN_USERS_ERROR
                        });

                    break;
                }
            }

            if (!isError) {
                this.countdownError.remove(this.COUNTDOWN_IDS.USERS_ERROR);
            }
        },
        checkValid: function () {
            var ret = true, i = 0, users = API.getUsers();

            _.each(this.$el.children(), function (elem) {
                if (!ret) { return; }

                var user = users[i];

                elem = $(elem);

                if (elem.text() !== user.username) {
                    ret = false;
                    return;
                }

                if (elem.hasClass('item-woot') && 1 !== user.vote) {
                    ret = false;
                    return;
                }

                if (elem.hasClass('item-meh') && -1 !== user.vote) {
                    ret = false;
                    return;
                }

                if (elem.hasClass('item-curated') && true !== user.curated) {
                    ret = false;
                    return;
                }

                i += 1;
                if (i > users.length) {
                    ret = false;
                }
            });

            return ret;
        },
        close: function () {
            // close countdown
            this.countdownError.close();

            // close collection
            this.collection.close();

            // remove sub-views
            this.closeAllSubViews();

            this.remove();
        }
    });

    return View;
});
