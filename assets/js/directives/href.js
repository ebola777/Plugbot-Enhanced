define(['plugbot/directives/module'], function (module) {
    'use strict';

    module.directive('href', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var variable = attrs.href;

                function changeLink() {
                    var value = scope[variable];

                    if (value) {
                        element.attr('target', '_blank');
                        element.attr('href', value);
                    } else {
                        if (_.isFunction(scope.getMediaLink)) {
                            scope.getMediaLink();
                        }
                    }
                }

                element.on('click', changeLink);
                element.on('mouseenter', changeLink);

                element.on('$destroy', function () {
                    element.off('click', changeLink);
                    element.off('mouseenter', changeLink);
                });
            }
        };
    });
});
