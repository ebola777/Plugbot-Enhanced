define('Plugbot/colls/Userlist/ItemCollection', [], function () {
    'use strict';

    var Collection = Backbone.Collection.extend({
        comparator: function (first, second) {
            var ret = 0,
                ascend = 1,
                permission1 = first.get('permission'),
                permission2 = second.get('permission'),
                username1 = first.get('username'),
                username2 = second.get('username'),
                username1Lower = username1.toLowerCase(),
                username2Lower = username2.toLowerCase();

            if (permission1 > permission2) {
                ret = -ascend;
            } else if (permission1 < permission2) {
                ret = ascend;
            } else {
                if (username1Lower < username2Lower) {
                    ret = -ascend;
                } else if (username1Lower > username2Lower) {
                    ret = ascend;
                } else {
                    if (username1 < username2) {
                        ret = -ascend;
                    } else if (username1 > username2) {
                        ret = ascend;
                    }
                }
            }

            return ret;
        },
        close: function () {
            this.reset();
        }
    });

    return Collection;
});
