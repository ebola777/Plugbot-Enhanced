define('Plugbot/views/Taskbar/View', [
    'Plugbot/colls/Taskbar/ItemCollection',
    'Plugbot/tmpls/Taskbar/View',
    'Plugbot/utils/Countdown',
    'Plugbot/views/Taskbar/ItemView',
    'Plugbot/views/utils/UiHelpers'
], function (TaskbarItemCollection, TaskbarViewTemplate, Countdown,
             TaskbarItemView, UiHelpers) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Runtime
                 */
                template: undefined,
                views: {},
                countdownSlide: (new Countdown()),
                countdownTask: (new Countdown()),
                currentWindow: undefined
            };
        },
        events: {
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        TEMPLATE: TaskbarViewTemplate,
        initialize: function () {
            _.bindAll(this);
            _.defaults(this.options, this.defaults());

            // init template
            this.options.template = new this.TEMPLATE({view: this});

            this.collection = new TaskbarItemCollection();

            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'remove', this.removeOne);

            this.bindUiEvents();
        },
        render: function () {
            // render
            this.options.template
                .setSelf()
                .cacheElements();

            this.$el.trigger('mouseleave');

            return this;
        },
        addOne: function (mod) {
            var newView = new TaskbarItemView({
                    model: mod
                }),
                indMod;

            this.options.views[mod.cid] = newView;

            // add element
            indMod = this.collection.indexOf(mod);
            UiHelpers.insertAt(newView.render().el, this.$elContainer, indMod);

            // listen to child events
            this.listenToItem(newView);

            // listen to window events
            this.listenToWindow(mod.get('window'));
        },
        removeOne: function (mod) {
            var cid = mod.cid,
                views = this.options.views;

            // stop listening
            this.stopListeningItem(this.options.views[mod.cid]);
            this.stopListeningWindow(mod.get('window'));

            // resume countdowns
            this.options.countdownSlide.resumeAll();
            this.options.countdownTask.resumeAll();

            // reset current window
            this.options.currentWindow = undefined;

            // remove view
            views[cid].close();
            delete views[cid];
        },
        listenToItem: function (view) {
            var that = this,
                dispatcher = view.options.dispatcher,
                cid = view.model.cid,
                idMouseEnter = 'mouse-enter',
                idMouseLeave = 'mouse-leave';

            this.listenTo(dispatcher, dispatcher.MOUSE_ENTER,
                function (options) {
                    that.options.countdownTask
                        .remove(idMouseEnter + ':' + cid)
                        .add(idMouseEnter + ':' + cid, {
                            call: function () {
                                var window = options.model.get('window');

                                that.options.currentWindow = window;
                                that.showWindow(window);
                            },
                            countdown: 300
                        });
                });

            this.listenTo(dispatcher, dispatcher.MOUSE_LEAVE,
                function (options) {
                    that.options.countdownTask
                        .remove(idMouseLeave + ':' + cid)
                        .add(idMouseLeave + ':' + cid, {
                            call: function () {
                                var window = options.model.get('window');

                                that.options.currentWindow = undefined;
                                that.hideWindow(window);
                            },
                            countdown: 300
                        });
                });
        },
        listenToWindow: function (view) {
            var dispatcher = view.options.dispatcher,
                countdownSlide = this.options.countdownSlide,
                countdownTask = this.options.countdownTask;

            this.listenTo(dispatcher, dispatcher.MOUSE_ENTER,
                function () {
                    countdownSlide.suspendAll();
                    countdownTask.suspendAll();
                });

            this.listenTo(dispatcher, dispatcher.MOUSE_LEAVE,
                function () {
                    countdownSlide.resumeAll();
                    countdownTask.resumeAll();
                });
        },
        stopListeningItem: function (view) {
            var dispatcher = view.options.dispatcher,
                cidMod = view.model.cid;

            this.stopListening(dispatcher);
            this.options.countdownTask
                .remove('mouse-enter:' + cidMod)
                .remove('mouse-leave:' + cidMod);
        },
        stopListeningWindow: function (view) {
            var dispatcher = view.options.dispatcher;

            this.stopListening(dispatcher);
        },
        showWindow: function (wnd) {
            wnd.model.set({
                x: this.$el.width() + $(window).scrollLeft(),
                y: this.model.get('windowTop'),
                zIndex: 10000
            });
            wnd.show();
        },
        hideWindow: function (wnd) {
            wnd.hide();
        },
        expand: function () {
            this.$el.animate({
                left: 0
            }, 200);
        },
        collapse: function () {
            this.$el.animate({
                left: -this.$elContent.width()
            }, 200);
        },
        bindUiEvents: function () {
            $(window).on('scroll', this.onWindowScroll);
        },
        unbindUiEvents: function () {
            $(window).off('scroll', this.onWindowScroll);
        },
        onWindowScroll: function () {
            var currentWindow = this.options.currentWindow;

            if (undefined !== currentWindow) {
                this.showWindow(this.options.currentWindow);
            }
        },
        onMouseEnter: function () {
            var that = this,
                countdownSlide = this.options.countdownSlide;

            countdownSlide
                .remove('mouse-leave')
                .add('mouse-enter', {
                    call: function () {
                        that.expand();
                    },
                    countdown: 100
                });
        },
        onMouseLeave: function () {
            var that = this,
                countdownSlide = this.options.countdownSlide;

            countdownSlide
                .remove('mouse-enter')
                .add('mouse-leave', {
                    call: function () {
                        that.collapse();
                    },
                    countdown: 500
                });
        },
        close: function () {
            var key, views = this.options.views;

            this.unbindUiEvents();

            this.remove();

            this.collection.close();

            for (key in views) {
                if (views.hasOwnProperty(key)) {
                    views[key].close();
                }
            }
        }
    });

    return View;
});
