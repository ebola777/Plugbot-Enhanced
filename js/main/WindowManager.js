define('Plugbot/main/WindowManager', [
    'Plugbot/utils/Watcher',
    'Plugbot/main/Settings',
    'Plugbot/events/SiteEvents',
    'Plugbot/views/Ui',
    'Plugbot/models/dialog/FloatedWindow',
    'Plugbot/views/dialog/FloatedWindow',
    'Plugbot/models/dialog/Taskbar',
    'Plugbot/views/dialog/Taskbar',
    'Plugbot/models/dialog/TaskbarItemModel'
], function (Watcher, Settings, SiteEvents, Ui, FloatedWindow,
             FloatedWindowView, Taskbar, TaskbarView, TaskbarItemModel) {
    'use strict';

    //region PUBLIC FUNCTIONS =====
    function initTaskbar() {
        var taskbarModel, taskbarView;

        taskbarModel = new Taskbar({
            windows: Plugbot.settings.windows,
            windowTop: Ui.plugdj.LAYOUT.BAR_HEIGHT
        });
        taskbarView = new TaskbarView({
            model: taskbarModel
        });
        $(document.body).append(taskbarView.render().el);
        Plugbot.taskbar = taskbarView;

        updateTaskbarPosSize(taskbarView,
            Ui.plugdj.LAYOUT.BAR_HEIGHT - $(window).scrollTop(),
            $(Ui.plugdj.room).height());
        listenEventsTaskbar(taskbarView);
        bindUiEventsTaskbar(taskbarView);
    }

    function initWindows() {
        var key,
            windows = Plugbot.settings.windows,
            windowSettings,
            windowModel,
            windowView;

        Plugbot.windows = Plugbot.windows || {};
        for (key in windows) {
            if (windows.hasOwnProperty(key)) {
                // show floated windows
                windowSettings = windows[key];
                windowModel = new FloatedWindow(windowSettings);
                windowView = new FloatedWindowView({
                    model: windowModel
                });
                $(document.body).append(windowView.render().el);
                Plugbot.windows[key] = windowView;

                listenEventsWindow(windowView);
                watchActivitesWindow(windowView);
            }
        }
    }

    function initPublicMethods() {
        var fnSwitchVisibility = function (en) {
                var key, windows = Plugbot.windows,
                    action = (en ? 'removeClass' : 'addClass');

                // taskbar
                Plugbot.taskbar.$el[action]('plugbot-taskbar-hidden');

                // each window
                for (key in windows) {
                    if (windows.hasOwnProperty(key)) {
                        windows[key]
                            .$el[action]('plugbot-floated-window-hidden');
                    }
                }
            };

        Plugbot.hide = function () {
            fnSwitchVisibility(false);
            return this;
        };

        Plugbot.show = function () {
            fnSwitchVisibility(true);
            return this;
        };
    }

    function removeTaskbar() {
        unbindUiEventsTaskbar();

        Plugbot.taskbar.close();
    }

    function removeWindows() {
        var key, windows = Plugbot.windows;

        for (key in windows) {
            if (windows.hasOwnProperty(key)) {
                windows[key].close();
            }
        }
    }

    //endregion

    //region PRIVATE FUNCTIONS =====
    function listenEventsTaskbar(taskbar) {
        var listener = {},
            dispatcherSite = SiteEvents.dispatcher;

        _.extend(listener, Backbone.Events);

        // site events
        listener.listenTo(dispatcherSite,
            dispatcherSite.LAYOUT.RESIZE, function (e) {
                var barHeight = Ui.plugdj.LAYOUT.BAR_HEIGHT;

                updateTaskbarPosSize(taskbar,
                    barHeight - $(window).scrollTop(),
                    e.height - 2 * barHeight);
            });
    }

    function bindUiEventsTaskbar(taskbar) {
        $(window).on('scroll', {taskbar: taskbar}, onScrollTaskbar);
    }

    function onScrollTaskbar(e) {
        var taskbar = e.data.taskbar;

        updateTaskbarPosSize(taskbar,
            Ui.plugdj.LAYOUT.BAR_HEIGHT - $(window).scrollTop(),
            undefined);
    }

    function listenEventsWindow(window) {
        var listener = {},
            dispatcherSite = SiteEvents.dispatcher,
            dispatcherWindow = window.options.dispatcher,
            uiRoom = $(Ui.plugdj.room),
            lastWidth = uiRoom.width();

        _.extend(listener, Backbone.Events);

        // site events
        listener.listenTo(dispatcherSite,
            dispatcherSite.LAYOUT.RESIZE, function (e) {
                if (window.model.get('visible')) {
                    window.model.set('x',
                        window.model.get('x') * (e.availWidth / lastWidth));
                    lastWidth = e.availWidth;
                }
            });

        // window events
        listener
            .listenTo(dispatcherWindow,
                dispatcherWindow.CHANGEANY_MODEL, function () {
                    var windowName = window.model.get('name'),
                        attr = _.clone(window.model.attributes);

                    // filter attributes
                    delete attr.tableLayout;

                    // save settings
                    Plugbot.settings.windows[windowName] = attr;
                    Settings.saveSettingsDelay();
                })
            .listenTo(dispatcherWindow,
                dispatcherWindow.AFTER_RENDER, function () {
                    var status = window.model.get('status');

                    if ('minimized' === status) {
                        minimizeWindow(window, {recordOldPos: false});
                    }
                })
            .listenTo(dispatcherWindow,
                dispatcherWindow.CONTROLBOX_MINIMIZE, function () {
                    var status = window.model.get('status');

                    if ('minimized' !== status) {
                        minimizeWindow(window);
                    }
                })
            .listenTo(dispatcherWindow,
                dispatcherWindow.CONTROLBOX_MAXIMIZE, function () {
                    var status = window.model.get('status');

                    if ('minimized' === status) {
                        restoreWindow(window);
                    }
                });
    }

    function watchActivitesWindow(window) {
        var lastZIndex = -1,
            uiPlaylistPanel = $(Ui.plugdj.playlistPanel);

        (new Watcher()).add(function () {
            if (uiPlaylistPanel.is(':visible')) {
                if (-1 === lastZIndex) {
                    lastZIndex = window.model.get('zIndex');
                    window.model.set('zIndex', 2);
                }
            } else {
                if (-1 !== lastZIndex) {
                    window.model.set('zIndex', lastZIndex);
                    lastZIndex = -1;
                }
            }
        });
    }

    function updateTaskbarPosSize(taskbar, top, height) {
        taskbar.$el.css({
            top: top,
            height: height
        });
    }

    function minimizeWindow(window, options) {
        // default options
        options = options || {};
        _.defaults(options, {recordOldPos: true});

        // set window status
        window.model.set('status', 'minimized');

        // disable resizable and draggable
        window.switchResizable(false);
        window.switchDraggable(false);

        // store old position and z-index
        if (options.recordOldPos) {
            window.model.set({
                oldX: window.model.get('x'),
                oldY: window.model.get('y'),
                oldZIndex: window.model.get('zIndex')
            });
        }

        // hide
        window.hide();

        // add task item to taskbar
        Plugbot.taskbar.collection.add(
            new TaskbarItemModel({
                name: window.model.get('name'),
                title: window.model.get('title'),
                window: window
            })
        );
    }

    function restoreWindow(window) {
        var coll = Plugbot.taskbar.collection;

        // set window status
        window.model.set('status', 'normal');

        // enable resizable and draggable
        window.switchResizable(true);
        window.switchDraggable(true);

        // restore old position
        window.model.set({
            x: window.model.get('oldX'),
            y: window.model.get('oldY'),
            zIndex: window.model.get('oldZIndex')
        });

        // show
        window.show();

        // remove task item from taskbar
        coll.remove(coll.findWhere({
            name: window.model.get('name')
        }));
    }

    function unbindUiEventsTaskbar() {
        $(window).off('scroll', onScrollTaskbar);
    }

    //endregion

    return {
        initTaskbar: initTaskbar,
        initWindows: initWindows,
        initPublicMethods: initPublicMethods,
        removeTaskbar: removeTaskbar,
        removeWindows: removeWindows
    };
});
