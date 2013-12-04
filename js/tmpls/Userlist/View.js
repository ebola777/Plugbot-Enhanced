define('Plugbot/tmpls/Userlist/View', [
    'Plugbot/base/Template'
], function (BaseTemplate) {
    'use strict';

    var View = BaseTemplate.extend({
        elements: {
            elHead: '.head',
            elWrapList: '.wrap-list',
            elList: '.list'
        },
        template:
            '<div class="row-head">' +
            '    <div class="{{getName elHead}}"><\/div>' +
            '<\/div>' +
            '<div class="row-list">' +
            '    <div class="{{getName elWrapList}}">' +
            '        <ul class="{{getName elList}}"><\/ul>' +
            '    <\/div>' +
            '<\/div>'
    });

    return View;
});
