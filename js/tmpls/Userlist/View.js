define('Plugbot/tmpls/Userlist/View', [
    'Plugbot/base/Template'
], function (BaseTemplate) {
    'use strict';

    var View = BaseTemplate.extend({
        elements: {
            elHead: '.head',
            elWrapUsers: '.wrap-users',
            elUsers: '.users',
            clsHead: '.row-head',
            clsUsers: '.row-users'
        },
        template:
            '<div class="{{clsHead}}">' +
            '    <div class="{{elHead}}"><\/div>' +
            '<\/div>' +
            '<div class="{{clsUsers}}">' +
            '    <div class="{{elWrapUsers}}">' +
            '        <ul class="{{elUsers}}"><\/ul>' +
            '    <\/div>' +
            '<\/div>'
    });

    return View;
});
