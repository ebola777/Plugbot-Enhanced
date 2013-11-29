define('Plugbot/views/Userlist/UsersItemView', [
    'handlebars',
    'Plugbot/utils/API'
], function (Handlebars, UtilsAPI) {
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
            var ret, VOTE = UtilsAPI.USER.VOTE;

            switch (vote) {
            case VOTE.WOOT:
                ret = 'item-woot';
                break;
            case VOTE.UNDECIDED:
                ret = 'item-undecided';
                break;
            case VOTE.MEH:
                ret = 'item-meh';
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
