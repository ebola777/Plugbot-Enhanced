define('Plugbot/tmpls/Userlist/HeadView', [
    'Plugbot/base/Template'
], function (BaseTemplate) {
    'use strict';

    var View = BaseTemplate.extend({
        elements: {
        },
        template:
            '<h1 class="userlist-wait-list-pos">{{textWaitListPos}}<\/h1>'
    });

    return View;
});
