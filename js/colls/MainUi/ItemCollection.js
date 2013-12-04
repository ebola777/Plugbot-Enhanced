define('Plugbot/colls/MainUi/ItemCollection', [
    'Plugbot/models/MainUi/ItemModel'
], function (MainUiModel) {
    'use strict';

    var Collection = Backbone.Collection.extend({
        model: MainUiModel,
        initialize: function () {
            _.bindAll(this);
        },
        close: function () {
            this.reset();
        }
    });

    return Collection;
});
