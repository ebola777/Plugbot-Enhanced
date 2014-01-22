define('Plugbot/main/mgrs/WindowManager', [
    'Plugbot/events/mgrs/WindowManager',
    'Plugbot/main/mgrs/ResourceManager',
    'Plugbot/models/FloatedWindow/Model',
    'Plugbot/views/FloatedWindow/View',
    'Plugbot/views/utils/Ui'
], function (Events, ResourceManager, FloatedWindowModel, FloatedWindowView,
             Ui) {
    'use strict';

    var View = Backbone.View.extend({
        STATUS: FloatedWindowView.prototype.STATUS,
        options: function () {
            return {
                windowSettings: {}
            };
        },
        initialize: function () {
            // runtime options
            this.dispatcher = Events.getDispatcher();
            this.windows = {};
            this.windowSettings = {};
        },
        render: function () {
            this._initSettings();
            this._initWindows();
        },
        show: function () {
            this._switchVisible(true);
        },
        hide: function () {
            this._switchVisible(false);
        },
        _initSettings: function () {
            this.windowSettings = this.options.windowSettings;
        },
        _initWindows: function () {
            var windowSettings = this.options.windowSettings,
                key,
                settings,
                windowModel,
                windowView;

            for (key in windowSettings) {
                if (windowSettings.hasOwnProperty(key)) {
                    settings = windowSettings[key];
                    windowModel = new FloatedWindowModel(settings);
                    windowView = new FloatedWindowView({
                        model: windowModel
                    });
                    Ui.plugdj.$body.append(windowView.render().el);
                    this.windows[key] = windowView;

                    this._listenToWindow(windowView);
                }
            }
        },
        _removeWindows: function () {
            var key, windows = this.windows;

            for (key in windows) {
                if (windows.hasOwnProperty(key)) {
                    windows[key].close();
                }
            }

            this.windows = {};
        },
        _switchVisible: function (en) {
            var key, windows = this.windows, window,
                action = (en ? 'removeClass' : 'addClass');

            // each window
            for (key in windows) {
                if (windows.hasOwnProperty(key)) {
                    window = windows[key];
                    window.$el[action](window.template.getClass('hidden'));
                }
            }
        },
        _minimize: function (window) {
            var windowName = window.model.get('name'),
                taskbarManager = ResourceManager.get('taskbar-manager');

            // set window status
            window.model.set('status', this.STATUS.MINIMIZED);

            // store settings
            this.windowSettings[windowName].status = this.STATUS.MINIMIZED;

            // disable resizable and draggable
            window
                .switchResizable(false)
                .switchDraggable(false);

            // hide the window
            window.hide();

            // add the item to taskbar
            taskbarManager.addOne(window);

            // dispatch change-settings
            this._dispatchChangeSettings();
        },
        _restore: function (window) {
            var windowName = window.model.get('name'),
                taskbarManager = ResourceManager.get('taskbar-manager'),
                settingsWindow = this.windowSettings[windowName];

            // set window status
            window.model.set('status', this.STATUS.NORMAL);

            // store settings
            this.windowSettings[windowName].status = this.STATUS.NORMAL;

            // restore old position
            window.model.set(settingsWindow);

            // enable resizable and draggable
            window
                .switchResizable(true)
                .switchDraggable(true);

            // show the window
            window.show();

            // remove the item from taskbar
            taskbarManager.removeOne(window);

            // dispatch change-settings
            this._dispatchChangeSettings();
        },
        _dispatchChangeSettings: function () {
            this.dispatcher.dispatch('CHANGE_SETTINGS', {
                windowSettings: this.windowSettings
            });
        },
        _listenToWindow: function (window) {
            var that = this,
                disprWindow = window.dispatcher,
                windowName = window.model.get('name');

            // window events
            this
                .listenTo(disprWindow,
                    disprWindow.AFTER_RENDER, function () {
                        var status = window.model.get('status');

                        if (that.STATUS.MINIMIZED === status) {
                            that._minimize(window);
                        }
                    })
                .listenTo(disprWindow,
                    disprWindow.CONTROLBOX_MINIMIZE, function () {
                        var status = window.model.get('status');

                        if (that.STATUS.NORMAL === status) {
                            that._minimize(window);
                        }
                    })
                .listenTo(disprWindow,
                    disprWindow.CONTROLBOX_RESTORE, function () {
                        var status = window.model.get('status');

                        if (that.STATUS.MINIMIZED === status) {
                            that._restore(window);
                        }
                    })
                .listenTo(disprWindow,
                    disprWindow.CHANGE_POS, function (options) {
                        var status = window.model.get('status');

                        if (that.STATUS.NORMAL === status || options.force) {
                            _.extend(that.windowSettings[windowName], options);
                        }

                        that._dispatchChangeSettings();
                    })
                .listenTo(disprWindow,
                    disprWindow.CHANGE_SIZE, function (options) {
                        var status = window.model.get('status');

                        if (that.STATUS.NORMAL === status) {
                            _.extend(that.windowSettings[windowName], options);
                        }

                        that._dispatchChangeSettings();
                    })
                .listenTo(disprWindow,
                    disprWindow.CHANGE_SETTINGS, function (options) {
                        _.extend(that.windowSettings[windowName].settings,
                            options);

                        that._dispatchChangeSettings();
                    });
        },
        close: function () {
            this._removeWindows();

            this.remove();
        }
    });

    return View;
});
