define(['plugbot/directives/module', 'angular'], function (module, angular) {
    'use strict';

    module.directive('draggable',
        ['$document', '$window', 'DomGeometry', 'Settings',
            function ($document, $window, DomGeometry, Settings) {
        return {
            restrict: 'A',
            scope: {
                dragGrid: '&'
            },
            controller: function ($scope) {
                $scope.settings = Settings.read();
                $scope.saveSettings = function () { Settings.save(); };
            },
            link: function (scope, element, attrs) {
                var start,
                    initialMouse,
                    initialScroll,
                    settings = scope.settings.window,
                    options,
                    runtime,
                    window = angular.element($window),
                    elemHandle = element.find(attrs.dragHandle) || element;

                function suspendIframe() {
                    var iframe = options.iframe,
                        originalPointerEvents = iframe.css('pointer-events');

                    iframe.css('pointer-events', 'none');

                    runtime.originalPointerEvents = originalPointerEvents;
                }

                function resumeIframe() {
                    var iframe = options.iframe;

                    iframe.css('pointer-events', runtime.originalPointerEvents);
                }

                function savePosition() {
                    if (options.id && runtime.currentPosition) {
                        settings[options.id] = runtime.currentPosition;
                        scope.saveSettings();
                    }
                }

                function setZIndex(value) {
                    element.css('z-index', value);
                }

                function getRect(pos, element) {
                    var width = element.outerWidth(),
                        height = element.outerHeight();

                    return {
                        left: pos.x,
                        top: pos.y,
                        right: pos.x + width,
                        bottom: pos.y + height,
                        width: width,
                        height: height
                    };
                }

                function getPosition(pos) {
                    var newSourceRect,
                        containment = options.containment,
                        isContain,
                        restraint,
                        ret = {
                            x: pos.x,
                            y: pos.y
                        };

                    // snap to grid
                    if (options.grid) {
                        ret.x -= ret.x % options.grid[0];
                        ret.y -= ret.y % options.grid[1];
                    }

                    // snap to other elements
                    _.each(options.snap, function (other) {
                        var snap = DomGeometry.getSnap(other, getRect(ret, element),
                            options.snapMode, options.snapTolerance);

                        if (snap.x || snap.y) {
                            ret.x += snap.x;
                            ret.y += snap.y;
                        }
                    });

                    // keep position inside containment
                    if (containment.length) {
                        newSourceRect = getRect(ret, element);

                        isContain = DomGeometry.isContain(containment, newSourceRect);

                        if (!isContain.x || !isContain.y) {
                            restraint = DomGeometry.getRestraint(containment, newSourceRect);

                            if (!isContain.x) { ret.x = restraint.left; }
                            if (!isContain.y) { ret.y = restraint.top; }
                        }
                    }

                    return ret;
                }

                function validatePosition(pos) {
                    var ret = true,
                        sourceRect = getRect(pos, element),
                        containment = options.containment;

                    // is inside containment
                    if (containment.length) {
                        ret = DomGeometry.isContain(containment, sourceRect);
                    }

                    // no overlapping with other elements
                    if (ret) {
                        _.each(options.elemNoOverlap, function (other) {
                            if (ret) {
                                ret = !DomGeometry.isIntersect(other, sourceRect);
                            }
                        });
                    }

                    return ret;
                }

                function setElementPosition(pos) {
                    runtime.currentPosition = pos;

                    element.css({
                        left: pos.x,
                        top: pos.y
                    });
                }

                function moveElement(pos) {
                    var newPos = getPosition(pos);

                    if (validatePosition(newPos)) {
                        setElementPosition(newPos);
                    }
                }

                function onResize() {
                    scope.$apply(function () {
                        var elemKeepZoom = options.elemKeepZoom,
                            newSize,
                            scale,
                            newPos;

                        if (elemKeepZoom.length) {
                            newSize = {
                                width: elemKeepZoom.width(),
                                height: elemKeepZoom.height()
                            };

                            scale = {
                                width: newSize.width / runtime.originalKeepZoomSize.width,
                                height: newSize.height / runtime.originalKeepZoomSize.height
                            };

                            newPos = {
                                x: runtime.currentPosition.x * scale.width,
                                y: runtime.currentPosition.y * scale.height
                            };

                            newPos = getPosition(newPos);

                            if (validatePosition(newPos)) {
                                setElementPosition(newPos);
                            }

                            runtime.originalKeepZoomSize = newSize;
                        }
                    });
                }

                function onScroll() {
                    scope.$apply(function () {
                        var mouseOffset = runtime.currentMouseOffset,
                            scrollOffset = {
                                x: window.scrollLeft() - initialScroll.x,
                                y: window.scrollTop() - initialScroll.y
                            },
                            pos = {
                                x: start.x + mouseOffset.x + scrollOffset.x,
                                y: start.y + mouseOffset.y + scrollOffset.y
                            };

                        runtime.currentScrollOffset = scrollOffset;

                        moveElement(pos);
                    });
                }

                function onMouseMove($event) {
                    var scrollOffset = runtime.currentScrollOffset,
                        mouseOffset = {
                            x: $event.clientX - initialMouse.x,
                            y: $event.clientY - initialMouse.y
                        },
                        pos = {
                            x: start.x + mouseOffset.x + scrollOffset.x,
                            y: start.y + mouseOffset.y + scrollOffset.y
                        };

                    runtime.currentMouseOffset = mouseOffset;

                    moveElement(pos);

                    return false;
                }

                function onMouseUp() {
                    setZIndex(runtime.originalZIndex);
                    resumeIframe();
                    savePosition();

                    window.unbind('scroll', onScroll);

                    $document.unbind('mousemove', onMouseMove);
                    $document.unbind('mouseup', onMouseUp);
                }

                /**
                 * Init style
                 */
                element.css({
                    position: 'absolute'
                });

                /**
                 * Init options
                 */
                options = {
                    id: attrs.dragId,
                    zIndex: attrs.dragZIndex,
                    containment: angular.element(attrs.dragContainment),
                    containmentTolerance: attrs.dragContainmentTolerance,
                    iframe: angular.element(attrs.dragIframeFix),
                    grid: scope.dragGrid(),
                    snap: angular.element(attrs.dragSnap),
                    snapMode: attrs.dragSnapMode,
                    snapTolerance: attrs.dragSnapTolerance || 8,
                    elemNoOverlap: angular.element(attrs.dragNoOverlap),
                    elemKeepZoom: angular.element(attrs.dragKeepZoom)
                };

                /**
                 * Init runtime
                 */
                if (options.elemKeepZoom.length) {
                    runtime = {
                        currentPosition: {
                            x: element.prop('offsetLeft'),
                            y: element.prop('offsetTop')
                        },
                        originalKeepZoomSize: {
                            width: options.elemKeepZoom.width(),
                            height: options.elemKeepZoom.height()
                        }
                    };
                }

                /**
                 * Restore last position
                 */
                if (settings[options.id]) {
                    if (validatePosition(settings[options.id])) {
                        setElementPosition(settings[options.id]);
                    }
                }

                /**
                 * Bind window
                 */
                window.bind('resize', onResize);

                /**
                 * Bind mousedown
                 */
                elemHandle.bind('mousedown', function ($event) {
                    start = {
                        x: element.prop('offsetLeft'),
                        y: element.prop('offsetTop')
                    };

                    initialMouse = {
                        x: $event.clientX,
                        y: $event.clientY
                    };

                    initialScroll = {
                        x: window.scrollLeft(),
                        y: window.scrollTop()
                    };

                    _.extend(options, {
                        containment: angular.element(attrs.dragContainment),
                        iframe: angular.element(attrs.dragIframeFix),
                        snap: angular.element(attrs.dragSnap),
                        elemNoOverlap: angular.element(attrs.dragNoOverlap),
                        elemKeepZoom: angular.element(attrs.dragKeepZoom)
                    });

                    _.extend(runtime, {
                        currentMouseOffset: { x: 0, y: 0 },
                        currentScrollOffset: { x: 0, y: 0 },
                        currentPosition: undefined,
                        originalZIndex: element.css('z-index'),
                        originalPointerEvents: undefined
                    });

                    setZIndex(options.zIndex);
                    suspendIframe();

                    window.bind('scroll', onScroll);

                    $document.bind('mousemove', onMouseMove);
                    $document.bind('mouseup', onMouseUp);

                    return false;
                });

                element.on('$destroy', function () {
                    window.unbind('resize', onResize);
                });
            }
        };
    }]);
});
