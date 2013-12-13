define('Plugbot/views/Userlist/UsersItemView', [
    'Plugbot/tmpls/Userlist/UsersItemView',
    'Plugbot/utils/API',
    'Plugbot/views/utils/Ui'
], function (UserlistUsersItemTemplate, UtilsAPI, Ui) {
    'use strict';

    var View = Backbone.View.extend({
        initialize: function () {
            // runtime options
            this.template = new UserlistUsersItemTemplate({view: this});
        },
        events: {
            'click': 'onClick'
        },
        render: function () {
            this.template.setSelf({
                id: this.model.get('id'),
                clsVote: this.getClass(),
                text: this.model.get('username')
            });

            return this;
        },
        getClass: function () {
            var ret,
                tmpl = this.template,
                VOTE = UtilsAPI.USER.VOTE,
                curated = this.model.get('curated'),
                vote = this.model.get('vote');

            if (curated) {
                ret = tmpl.getClass('curated');
            } else {
                switch (vote) {
                case VOTE.WOOT:
                    ret = tmpl.getClass('woot');
                    break;
                case VOTE.MEH:
                    ret = tmpl.getClass('meh');
                    break;
                case VOTE.UNDECIDED:
                    ret = tmpl.getClass('undecided');
                    break;
                }
            }

            return ret;
        },
        onClick: function () {
            // mention
            Ui.plugdj.$chatInputField
                .val('@' + this.model.get('username') + ' ')
                .focus();
        },
        close: function () {
            this.remove();
        }
    });

    return View;
});
