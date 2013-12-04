define('Plugbot/tmpls/Taskbar/ItemView', [
    'Plugbot/base/Template'
], function (BaseTemplate) {
    'use strict';

    var View = BaseTemplate.extend({
        elements: {
        },
        template:
            '<li class="task">{{title}}<\/li>'
    });

    return View;
});
