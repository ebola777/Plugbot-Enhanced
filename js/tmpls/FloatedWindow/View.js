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
        template:
            '<div class="plugbot-floated-window">' +
            '    <div class="{{getName elHeader}}">' +
            '        <h1 class="{{getName elTitle}}">{{textTitle}}<\/h1>' +
            '        <div class="{{getName elControlBox}}">' +
            '            <button class="{{getName elMinimize}}"' +
            ' title="Minimize"><\/button>' +
            '            <button class="{{getName elMaximize}}"' +
            ' title="Restore"><\/button>' +
            '            <button class="{{getName elClose}}"' +
            ' title="Close"><\/button>' +
            '        <\/div>' +
            '    <\/div>' +
            '    <div class="{{getName elBody}}"><\/div>' +
            '<\/div>'
    });

    return View;
});
