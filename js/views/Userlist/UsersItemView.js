define('Plugbot/views/Userlist/UsersItemView', [
    'Plugbot/tmpls/Userlist/UsersItemView',
    'Plugbot/utils/API'
], function (UserlistUsersItemViewTemplate, UtilsAPI) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Runtime
                 */
                template: undefined
            };
        },
        TEMPLATE: UserlistUsersItemViewTemplate,
        initialize: function () {
            _.bindAll(this);
            _.defaults(this, this.defaults());

            // init template
            this.options.template = new this.TEMPLATE({view: this});
        },
        render: function () {
            var user = this.model.get('user');

            this.options.template.setSelf({
                id: this.model.get('id'),
                classVote: this.getClass(+user.vote),
                text: user.username
            });

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
