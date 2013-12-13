define('Plugbot/views/Taskbar/View', [
    'Plugbot/base/SubView',
    'Plugbot/colls/Taskbar/ItemCollection',
    'Plugbot/events/site/Events',
    'Plugbot/tmpls/Taskbar/View',
    'Plugbot/utils/Countdown',
    'Plugbot/views/Taskbar/ItemView',
    'Plugbot/views/utils/Ui',
    'Plugbot/views/utils/UiHelpers'
], function (BaseSubView, TaskbarItemCollection, SiteEvents, TaskbarTemplate,
             Countdown, TaskbarItemView, Ui, UiHelpers) {
    'use strict';

    var View = BaseSubView.extend({
        events: {
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        initialize: function () {
            _.bindAll(this, 'onWindowScroll');

            // parent
            this.parent = BaseSubView.prototype;
            this.parent.initialize.call(this);

            // runtime options
            this.currentWindow = undefined;
            this.countdownSlide = new Countdown();
            this.countdownTask = new Countdown();
            this.template = new TaskbarTemplate({view: this});

            // set collection
            this.collection = new TaskbarItemCollection();

            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'remove', this.removeOne);

            this.bindUiEvents();

            this.listenToSiteEvents();
        },
        render: function () {
            // render
            this.template
                .setSelf()
                .cacheElements();

            this.update();

            this.$el.trigger('mouseleave');

            return this;
        },
        update: function () {
            var uiWindow = Ui.plugdj.$window,
                uiHeader = Ui.plugdj.$header,
                uiRoom = Ui.plugdj.$room;

            // update position and size
            this.$el.css({
                top: uiHeader.height() - uiWindow.scrollTop(),
                height: uiRoom.height()
            });
        },
        addOne: function (mod) {
            var newView = new TaskbarItemView({
                    model: mod
                }),
                indMod;

            this.setSubView(mod.cid, newView);

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
                oldView = this.getSubView(cid);

            // resume countdowns
            this.countdownSlide.resumeAll();
            this.countdownTask.resumeAll();

            // reset current window
            this.currentWindow = undefined;

            // stop listening
            this.stopListeningItem(oldView);
            this.stopListeningWindow(mod.get('window'));

            // remove view
            this.closeSubView(cid);
        },
        showWindow: function (wnd) {
            wnd.model.set({
                x: this.$el.width() + Ui.plugdj.$window.scrollLeft(),
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
            Ui.plugdj.$window.on('scroll', this.onWindowScroll);
        },
        unbindUiEvents: function () {
            Ui.plugdj.$window.off('scroll', this.onWindowScroll);
        },
        listenToSiteEvents: function () {
            var that = this,
                disprSite = SiteEvents.getDispatcher();

            this.listenTo(disprSite, disprSite.RESIZE, function () {
                that.update();

                if (undefined !== that.currentWindow) {
                    that.showWindow(that.currentWindow);
                }
            });
        },
        /**
         * Listen to item events
         * @param {{Taskbar ItemView}} view     Taskbar item view
         */
        listenToItem: function (view) {
            var that = this,
                dispatcher = view.dispatcher,
                window = view.model.get('window'),
                cid = view.model.cid;

            this.listenTo(dispatcher, dispatcher.MOUSE_ENTER,
                function () {
                    that.countdownTask
                        .remove('mouse-leave:' + cid)
                        .add('mouse-enter:' + cid, function () {
                            that.currentWindow = window;
                            that.showWindow(window);
                        }, {
                            countdown: 300
                        });
                });

            this.listenTo(dispatcher, dispatcher.MOUSE_LEAVE,
                function () {
                    that.countdownTask
                        .remove('mouse-enter:' + cid)
                        .add('mouse-leave:' + cid, function () {
                            that.currentWindow = undefined;
                            that.hideWindow(window);
                        }, {
                            countdown: 300
                        });
                });
        },
        /**
         * Listen to window events
         * @param {{FloatedWindow View}} view    Floated window view
         */
        listenToWindow: function (view) {
            var dispr = view.dispatcher,
                countdownSlide = this.countdownSlide,
                countdownTask = this.countdownTask;

            this.listenTo(dispr, dispr.MOUSE_ENTER, function () {
                countdownSlide.suspendAll();
                countdownTask.suspendAll();
            });

            this.listenTo(dispr, dispr.MOUSE_LEAVE, function () {
                countdownSlide.resumeAll();
                countdownTask.resumeAll();
            });
        },
        stopListeningItem: function (view) {
            var dispr = view.dispatcher,
                cid = view.model.cid;

            this.stopListening(dispr);
            this.countdownTask
                .remove('mouse-enter:' + cid)
                .remove('mouse-leave:' + cid);
        },
        stopListeningWindow: function (view) {
            var dispr = view.dispatcher;

            this.stopListening(dispr);
        },
        onWindowScroll: function () {
            var currentWindow = this.currentWindow;

            this.update();

            if (undefined !== currentWindow) {
                this.showWindow(this.currentWindow);
            }
        },
        onMouseEnter: function () {
            var that = this;

            this.countdownSlide
                .remove('mouse-leave')
                .add('mouse-enter', function () {
                    that.expand();
                }, {
                    countdown: 100
                });
        },
        onMouseLeave: function () {
            var that = this;

            this.countdownSlide
                .remove('mouse-enter')
                .add('mouse-leave', function () {
                    that.collapse();
                }, {
                    countdown: 500
                });
        },
        close: function () {
            this.collection.close();

            this.unbindUiEvents();

            // close sub-views
            this.closeAllSubViews();

            // close self
            this.remove();
        }
    });

    return View;
});
