define('Plugbot/tmpls/FloatedWindow/View', [
    'Plugbot/base/Template'
], function (BaseTemplate) {
    'use strict';

    var View = BaseTemplate.extend({
        elements: {
            elHeader: '.header',
            elTitle: '.title',
            elControlBox: '.control-box',
            elMinimize: '.minimize',
            elMaximize: '.maximize',
            elClose: '.close',
            elBody: '.body'
        },
        elementIds: {
            elMinimize: null,
            elMaximize: null,
            elClose: null
        },
        classes: {
            hidden: '.plugbot-floated-window-hidden'
        },
        template:
            '<div class="plugbot-floated-window">' +
            '    <div class="{{elHeader}}">' +
            '        <h1 class="{{elTitle}}">{{textTitle}}<\/h1>' +
            '        <div class="{{elControlBox}}">' +
            '            <button class="{{elMinimize}}"' +
            ' title="Minimize"><\/button>' +
            '            <button class="{{elMaximize}}"' +
            ' title="Restore"><\/button>' +
            '            <button class="{{elClose}}"' +
            ' title="Close"><\/button>' +
            '        <\/div>' +
            '    <\/div>' +
            '    <div class="{{elBody}}"><\/div>' +
            '<\/div>'
    });

    return View;
});
