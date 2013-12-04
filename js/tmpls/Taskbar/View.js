define('Plugbot/tmpls/Taskbar/View', [
    'Plugbot/base/Template'
], function (BaseTemplate) {
    'use strict';

    var View = BaseTemplate.extend({
        elements: {
            elContent: '.content',
            elHandle: '.handle',
            elContainer: '.container'
        },
        template:
            '<div class="plugbot-taskbar">' +
            '    <div class="{{getName elContent}}">' +
            '        <ul class="{{getName elContainer}}"><\/ul>' +
            '    <\/div>' +
            '    <div class="{{getName elHandle}}"><\/div>' +
            '<\/div>'
    });

    return View;
});
