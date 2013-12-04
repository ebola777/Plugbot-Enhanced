define('Plugbot/tmpls/Userlist/UsersItemView', [
    'Plugbot/base/Template'
], function (BaseTemplate) {
    'use strict';

    var View = BaseTemplate.extend({
        elements: {
        },
        template:
            '<li class="userlist-item {{classVote}}" data-id="{{id}}">' +
                '{{text}}<\/li>'
    });

    return View;
});
