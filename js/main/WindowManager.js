define('Plugbot/main/WindowManager', [
    'Plugbot/events/site/Events',
    'Plugbot/main/Settings',
    'Plugbot/models/FloatedWindow/Model',
    'Plugbot/models/Taskbar/Model',
    'Plugbot/models/Taskbar/ItemModel',
    'Plugbot/views/FloatedWindow/View',
    'Plugbot/views/Taskbar/View',
    'Plugbot/views/utils/Ui'
], function (SiteEvents, Settings, FloatedWindowModel, TaskbarModel,
             TaskbarItemModel, FloatedWindowView, TaskbarView, Ui) {
    'use strict';

    //region PUBLIC FUNCTIONS =====
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

    function initTaskbar() {
        var taskbarModel, taskbarView;

        taskbarModel = new TaskbarModel({
            windows: Plugbot.settings.windows,
            windowTop: Ui.plugdj.$header.height()
        });
        taskbarView = new TaskbarView({
            model: taskbarModel
        });
        $(document.body).append(taskbarView.render().el);
        Plugbot.taskbar = taskbarView;
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
                windowModel = new FloatedWindowModel(windowSettings);
                windowView = new FloatedWindowView({
                    model: windowModel
                });
                $(document.body).append(windowView.render().el);
                Plugbot.windows[key] = windowView;

                listenToWindowEvents(windowView);
            }
        }
    }

    function initEvents() {
        watchActivities();
    }

    function removeEvents() {
        unwatchActivities();
    }

    function removeTaskbar() {
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
    function watchActivities() {
        var uiPlaylistPanel = Ui.plugdj.$playlistPanel,
            isVisible = true;

        Plugbot.watcher.add('playlistVisible', function () {
            if (uiPlaylistPanel.is(':visible')) {
                if (isVisible) {
                    Plugbot.hide();
                    isVisible = false;
                }
            } else {
                if (!isVisible) {
                    Plugbot.show();
                    isVisible = true;
                }
            }
        });
    }

    function unwatchActivities() {
        Plugbot.watcher.remove('playlistVisible');
    }

    function listenToWindowEvents(window) {
        var listener = _.clone(Backbone.Events),
            disprWindow = window.dispatcher;

        // window events
        listener
            .listenTo(disprWindow,
                disprWindow.AFTER_RENDER, function () {
                    var status = window.model.get('status');

                    if ('minimized' === status) {
                        minimizeWindow(window, {recordOldPos: false});
                    }
                })
            .listenTo(disprWindow,
                disprWindow.CONTROLBOX_MINIMIZE, function () {
                    var status = window.model.get('status');

                    if ('minimized' !== status) {
                        minimizeWindow(window);
                    }
                })
            .listenTo(disprWindow,
                disprWindow.CONTROLBOX_MAXIMIZE, function () {
                    var status = window.model.get('status');

                    if ('minimized' === status) {
                        restoreWindow(window);
                    }
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

    //endregion

    return {
        initPublicMethods: initPublicMethods,
        initTaskbar: initTaskbar,
        initWindows: initWindows,
        initEvents: initEvents,
        removeEvents: removeEvents,
        removeTaskbar: removeTaskbar,
        removeWindows: removeWindows
    };
});
