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
            '    <div class="{{elContent}}">' +
            '        <ul class="{{elContainer}}"><\/ul>' +
            '    <\/div>' +
            '    <div class="{{elHandle}}"><\/div>' +
            '<\/div>'
    });

    return View;
});
