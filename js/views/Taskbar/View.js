define('Plugbot/views/Taskbar/View', [
    'Plugbot/base/SubView',
    'Plugbot/colls/Taskbar/ItemCollection',
    'Plugbot/events/site/Events',
    'Plugbot/tmpls/Taskbar/View',
    'Plugbot/utils/Countdown',
    'Plugbot/views/Taskbar/ItemView',
    'Plugbot/views/utils/Ui',
    'Plugbot/views/utils/UiHelpers'
], function (BaseSubView, ItemCollection, SiteEvents, Template, Countdown,
             ItemView, Ui, UiHelpers) {
    'use strict';

    var View = BaseSubView.extend({
        COUNTDOWN_IDS: {
            MOUSE_LEAVE: 'mouse-leave',
            MOUSE_ENTER: 'mouse-enter'
        },
        MAX_ZINDEX: 10000,
        COUNTDOWN_MOUSE_ENTER: 100,
        COUNTDOWN_MOUSE_LEAVE: 500,
        COUNTDOWN_ITEM_MOUSE_ENTER: 300,
        COUNTDOWN_ITEM_MOUSE_LEAVE: 300,
        DURATION_ANIMATE_EXPAND: 200,
        DURATION_ANIMATE_COLLAPSE: 200,
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
            this.template = new Template({view: this});

            // set collection
            this.collection = new ItemCollection();

            // collection events
            this
                .listenTo(this.collection, 'add', this.addOne)
                .listenTo(this.collection, 'remove', this.removeOne);

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
        addOne: function (mod, coll) {
            var newView = new ItemView({
                    model: mod
                }),
                ind = coll.indexOf(mod),
                wnd = mod.get('window');

            this.setSubView(mod.cid, newView);

            // add element
            UiHelpers.insertAt(newView.render().el, this.$elContainer, ind);

            // listen to child events
            this.listenToItem(newView);

            // listen to window events
            this.listenToWindow(wnd);
        },
        removeOne: function (mod) {
            var cid = mod.cid,
                oldView = this.getSubView(cid),
                wnd = mod.get('window');

            // resume countdowns
            this.countdownSlide.resumeAll();
            this.countdownTask.resumeAll();

            // reset current window
            this.currentWindow = undefined;

            // stop listening
            this.stopListeningItem(oldView);
            this.stopListeningWindow(wnd);

            // remove view
            this.closeSubView(cid);
        },
        showWindow: function (wnd) {
            wnd.model.set('zIndex', this.MAX_ZINDEX);

            wnd.show({
                x: this.$el.width() + Ui.plugdj.$window.scrollLeft(),
                y: this.model.get('windowTop')
            });
        },
        hideWindow: function (wnd) {
            wnd.hide();
        },
        expand: function () {
            this.$el.animate({
                left: 0
            }, this.DURATION_ANIMATE_EXPAND);
        },
        collapse: function () {
            this.$el.animate({
                left: -this.$elContent.width()
            }, this.DURATION_ANIMATE_COLLAPSE);
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
         * @param {{ItemView}} view     Taskbar item view
         */
        listenToItem: function (view) {
            var that = this,
                dispatcher = view.dispatcher,
                window = view.model.get('window'),
                cid = view.model.cid,
                ID_MOUSE_LEAVE = this.COUNTDOWN_IDS.MOUSE_LEAVE + ':' + cid,
                ID_MOUSE_ENTER = this.COUNTDOWN_IDS.MOUSE_ENTER + ':' + cid;

            this
                .listenTo(dispatcher, dispatcher.MOUSE_ENTER,
                    function () {
                        that.countdownTask
                            .remove(ID_MOUSE_LEAVE)
                            .add(ID_MOUSE_ENTER, function () {
                                that.currentWindow = window;
                                that.showWindow(window);
                            }, {
                                countdown: that.COUNTDOWN_ITEM_MOUSE_ENTER
                            });
                    })
                .listenTo(dispatcher, dispatcher.MOUSE_LEAVE,
                    function () {
                        that.countdownTask
                            .remove(ID_MOUSE_ENTER)
                            .add(ID_MOUSE_LEAVE, function () {
                                that.currentWindow = undefined;
                                that.hideWindow(window);
                            }, {
                                countdown: that.COUNTDOWN_ITEM_MOUSE_LEAVE
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

            this
                .listenTo(dispr, dispr.MOUSE_ENTER, function () {
                    countdownSlide.suspendAll();
                    countdownTask.suspendAll();
                })
                .listenTo(dispr, dispr.MOUSE_LEAVE, function () {
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
                .remove(this.COUNTDOWN_IDS.MOUSE_LEAVE)
                .add(this.COUNTDOWN_IDS.MOUSE_ENTER, function () {
                    that.expand();
                }, {
                    countdown: this.COUNTDOWN_MOUSE_ENTER
                });
        },
        onMouseLeave: function () {
            var that = this;

            this.countdownSlide
                .remove(this.COUNTDOWN_IDS.MOUSE_ENTER)
                .add(this.COUNTDOWN_IDS.MOUSE_LEAVE, function () {
                    that.collapse();
                }, {
                    countdown: this.COUNTDOWN_MOUSE_LEAVE
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
