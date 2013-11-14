define('Plugbot/models/Userlist/ItemCollection', [
    'Plugbot/models/Userlist/ItemModel'
], function (UserlistItemModel) {
    'use strict';

    var Collection = Backbone.Collection.extend({
        model: UserlistItemModel,
        initialize: function () {
            _.bindAll(this);
        },
        comparator: function (first, second) {
            var ret = 0,
                ascend = 1,
                user1 = first.get('user'),
                user2 = second.get('user'),
                permission1 = +user1.permission,
                permission2 = +user2.permission,
                username1 = user1.username.toUpperCase(),
                username2 = user2.username.toUpperCase();

            if (permission1 > permission2) {
                ret = -ascend;
            } else if (permission1 < permission2) {
                ret = ascend;
            } else {
                if (username1 < username2) {
                    ret = -ascend;
                } else if (username1 > username2) {
                    ret = ascend;
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
