define('Plugbot/main/mgrs/TaskbarManager', [
    'Plugbot/models/Taskbar/Model',
    'Plugbot/models/Taskbar/ItemModel',
    'Plugbot/views/Taskbar/View',
    'Plugbot/views/utils/Ui'
], function (TaskbarModel, TaskbarItemModel, TaskbarView, Ui) {
    'use strict';

    var View = Backbone.View.extend({
        initialize: function () {
            // runtime options
            this.taskbar = undefined;
        },
        render: function () {
            this._initTaskbar();
        },
        show: function () {
            this._switchVisible(true);
        },
        hide: function () {
            this._switchVisible(false);
        },
        addOne: function (window) {
            this.taskbar.collection.add(new TaskbarItemModel({
                window: window,
                name: window.model.get('name'),
                title: window.model.get('title')
            }));
        },
        removeOne: function (window) {
            var coll = this.taskbar.collection;

            coll.remove(coll.findWhere({
                name: window.model.get('name')
            }));
        },
        _initTaskbar: function () {
            var taskbarModel, taskbarView;

            taskbarModel = new TaskbarModel({
                windowTop: Ui.plugdj.$header.height()
            });
            taskbarView = new TaskbarView({
                model: taskbarModel
            });
            Ui.plugdj.$body.append(taskbarView.render().el);
            this.taskbar = taskbarView;
        },
        _switchVisible: function (en) {
            var taskbar = this.taskbar,
                action = (en ? 'removeClass' : 'addClass');

            taskbar.$el[action](taskbar.template.getClass('hidden'));
        },
        close: function () {
            this.taskbar.close();

            this.remove();
        }
    });

    return View;
});
