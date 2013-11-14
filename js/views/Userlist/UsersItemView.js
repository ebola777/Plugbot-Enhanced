define('Plugbot/views/Userlist/UsersItemView', [
    'handlebars'
], function (Handlebars) {
    'use strict';

    var View = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this);
        },
        template: Handlebars.compile(
            '    <li class="userlist-item {{classVote}}" data-id="{{id}}">' +
                '{{text}}<\/li>'
        ),
        render: function () {
            var user = this.model.get('user');

            this.setElement(this.template({
                id: this.model.get('id'),
                classVote: this.getClass(+user.vote),
                text: user.username
            }));

            return this;
        },
        getClass: function (vote) {
            var ret;

            switch (vote) {
            case 1:
                ret = 'item-woot';
                break;
            case -1:
                ret = 'item-meh';
                break;
            case 0:
                ret = 'item-undecided';
                break;
            }

            return ret;
        },
        close: function () {
            this.remove();
        }
    });

    return View;
});
