define('Plugbot/tmpls/MainUi/View', [
    'Plugbot/base/Template'
], function (BaseTemplate) {
    'use strict';

    var View = BaseTemplate.extend({
        elements: {
            clsItems: '.item',
            elAutoWoot: '#plugbot-btn-auto-woot',
            elAutoJoin: '#plugbot-btn-auto-join',
            elSkipVideo: '#plugbot-btn-skip-video'
        },
        elementIds: {
            elAutoWoot: null,
            elAutoJoin: null,
            elSkipVideo: null
        },
        ids: {
        },
        classes: {
            enabled: '.enabled'
        },
        events: {
            'click {{clsItems}}': 'onClickItem'
        },
        template:
            '<p id="{{elAutoWoot}}" class="item">auto-woot<\/p>' +
            '<p id="{{elAutoJoin}}" class="item">auto-join<\/p>' +
            '<p id="{{elSkipVideo}}" class="item">skip-video<\/p>'
    });

    return View;
});
