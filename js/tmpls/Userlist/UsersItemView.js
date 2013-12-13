define('Plugbot/tmpls/Userlist/UsersItemView', [
    'Plugbot/base/Template'
], function (BaseTemplate) {
    'use strict';

    var View = BaseTemplate.extend({
        elements: {
            clsItem: '.item'
        },
        classes: {
            curated: '.item-curated',
            woot: '.item-woot',
            meh: '.item-meh',
            undecided: '.item-undecided'
        },
        template:
            '<li class="{{clsItem}} {{clsVote}}" data-id="{{id}}">' +
                '{{text}}<\/li>'
    });

    return View;
});
