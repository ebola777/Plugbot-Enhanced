define('Plugbot/colls/Taskbar/ItemCollection', [
    'Plugbot/models/Taskbar/ItemModel'
], function (TaskbarItemModel) {
    'use strict';

    var Collection = Backbone.Collection.extend({
        model: TaskbarItemModel,
        comparator: function (first, second) {
            var ret = 0,
                ascend = -1,
                window1 = first.get('window').model,
                window2 = second.get('window').model,
                zIndex1 = window1.get('oldZIndex'),
                zIndex2 = window2.get('oldZIndex');

            if (zIndex1 < zIndex2) {
                ret = -ascend;
            } else if (zIndex1 > zIndex2) {
                ret = ascend;
            }

            return ret;
        },
        close: function () {
            this.reset();
        }
    });

    return Collection;
});
