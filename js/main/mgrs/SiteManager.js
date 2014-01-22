define('Plugbot/main/mgrs/SiteManager', [
    'Plugbot/main/mgrs/ResourceManager',
    'Plugbot/utils/Watcher',
    'Plugbot/views/utils/Ui'
], function (ResourceManager, Watcher, Ui) {
    'use strict';

    var View = Backbone.View.extend({
        WATCHER_IDS: {
            PLAYLIST_PANEL_VISIBLE: 'playlist-panel-visible'
        },
        initialize: function () {
            // runtime options
            this.watcher = new Watcher();
        },
        render: function () {
            this._watchActivities();
        },
        _show: function () {
            var windowManager = ResourceManager.get('window-manager'),
                taskbarManager = ResourceManager.get('taskbar-manager');

            windowManager.show();
            taskbarManager.show();
        },
        _hide: function () {
            var windowManager = ResourceManager.get('window-manager'),
                taskbarManager = ResourceManager.get('taskbar-manager');

            windowManager.hide();
            taskbarManager.hide();
        },
        _watchActivities: function () {
            var that = this,
                uiPlaylistPanel = Ui.plugdj.$playlistPanel,
                isVisible = true;

            this.watcher.add(this.WATCHER_IDS.PLAYLIST_PANEL_VISIBLE,
                function () {
                    if (uiPlaylistPanel.is(':visible')) {
                        if (isVisible) {
                            that._hide();
                            isVisible = false;
                        }
                    } else {
                        if (!isVisible) {
                            that._show();
                            isVisible = true;
                        }
                    }
                });
        },
        _unwatchActivities: function () {
            this.watcher.remove(this.WATCHER_IDS.PLAYLIST_PANEL_VISIBLE);
        },
        close: function () {
            this.watcher.close();

            this._unwatchActivities();

            this.remove();
        }
    });

    return View;
});
