define('Plugbot/tmpls/MainUi/ItemView', [
    'Plugbot/base/Template'
], function (BaseTemplate) {
    'use strict';

    var View = BaseTemplate.extend({
        elements: {
        },
        template:
            '<p id="{{id}}" class="{{class}}">{{text}}<\/p>'
    });

    return View;
});
