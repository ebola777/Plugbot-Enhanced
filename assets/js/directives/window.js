define(['plugbot/directives/module', 'angular'], function (module, angular) {
    'use strict';

    module.directive('window', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var elemHandleButtons = element.find('.handle-buttons'),
                    children;

                function processActions(elemButton, action) {
                    var elemToggle = angular.element(elemButton.data('window-toggle'));

                    if (elemToggle.length) {
                        elemToggle[action]();
                    } else {
                        element[action]();
                    }
                }

                function onClick(event) {
                    scope.$apply(function () {
                        var elemButton = angular.element(event.target),
                            action;

                        if (scope.handleButtonClick) {
                            action = scope.handleButtonClick(elemButton.data('window-id'));
                            processActions(elemButton, action);
                        }
                    });
                }

                /**
                 * Default visibility
                 */
                if (attrs.window) {
                    element[attrs.window]();
                }

                /**
                 * Bind handle buttons
                 */
                if (elemHandleButtons.length) {
                    children = elemHandleButtons.children();

                    if (children.length) {
                        children.bind('click', onClick);
                    }
                }

                element.on('$destroy', function () {
                    children.unbind('click', onClick);
                });
            }
        };
    });
});
