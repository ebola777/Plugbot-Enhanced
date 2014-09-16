/**
 * Make an element draggable
 *
 * Angular directives:
 * draggable            Make element draggable
 * drag-id              =<String> ID for settings
 * drag-relative        Make main element absolute when moving, set to relative when released
 * drag-z-index         =<Number> ZIndex of main element when moving
 * drag-containment     =<String>, selector, constrain main element inside this element
 * drag-iframe-fix      =<String>, selector, fix iframe
 * drag-handle          =<String>, selector, only move when user clicks this element, if not defined, use main element
 * drag-cancel          =<String>, selector, cancel moving if user clicks these elements which are inside handle
 * drag-grid            =[<Number>, <Number>] X and Y grid moving
 * drag-snap            =<String>, selector, snap to these elements
 * drag-snap-mode       =<String>, "outer", "inner", or "both", snap to outer edges or inner edges or both
 * drag-snap-tolerance  =<Number>, snap tolerance, when main element is closed enough to a snap target, snap!
 * drag-no-overlap      =<String>, selector, keep main element from overlapping with these elements
 * drag-keep-zoom       =<String>, selector, keep main element position relative to this element
 */

define(['plugbot/directives/module', 'angular'], function (module, angular) {
    'use strict';

    module.directive('draggable', ['$document', '$window', 'DomGeometry', 'Settings',
        function ($document, $window, DomGeometry, Settings) {
            return {
                restrict: 'A',
                scope: {
                    dragGrid: '&'
                },
                controller: function ($scope) {
                    var settingsWindow;

                    $scope.settings = Settings.read();

                    settingsWindow = $scope.settings.window;

                    $scope.loadPosition = function (id, fnValidate, fnSetPosition) {
                        if (id && settingsWindow[id]) {
                            if (fnValidate(settingsWindow[id])) {
                                fnSetPosition(settingsWindow[id]);
                            }
                        }
                    };

                    $scope.savePosition = function (id, currentPosition) {
                        if (id && currentPosition) {
                            settingsWindow[id] = currentPosition;
                            Settings.save();
                        }
                    };
                },
                link: function (scope, element, attrs) {
                    var start,
                        initialMouse,
                        initialScroll,
                        options,
                        runtime,
                        window = angular.element($window),
                        originalZIndex = element.css('z-index'),
                        elemHandle = element.find(attrs.dragHandle);

                    function suspendIframe() {
                        var iframe = options.iframe,
                            originalPointerEvents;

                        if (iframe.length) {
                            originalPointerEvents = iframe.css('pointer-events');
                            iframe.css('pointer-events', 'none');

                            runtime.originalPointerEvents = originalPointerEvents;
                        }
                    }

                    function resumeIframe() {
                        var iframe = options.iframe;

                        if (iframe.length) {
                            iframe.css('pointer-events', runtime.originalPointerEvents);
                        }
                    }

                    function setAbsolute() {
                        if (options.relative) {
                            element.css({
                                position: 'absolute',
                                left: element.prop('offsetLeft'),
                                top: element.prop('offsetTop'),
                                width: element.outerWidth(),
                                height: element.outerHeight()
                            });
                        }
                    }

                    function setRelative() {
                        if (options.relative) {
                            element.css({
                                position: 'relative',
                                left: '',
                                top: '',
                                width: '',
                                height: ''
                            });
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

                    function onMouseMove(event) {
                        var scrollOffset = runtime.currentScrollOffset,
                            mouseOffset = {
                                x: event.clientX - initialMouse.x,
                                y: event.clientY - initialMouse.y
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
                        scope.savePosition(options.id, runtime.currentPosition);

                        setRelative();
                        setZIndex(originalZIndex);
                        resumeIframe();

                        window.off('scroll', onScroll);
                        $document.off('mousemove', onMouseMove);
                        $document.off('mouseup', onMouseUp);

                        return false;
                    }

                    function onMouseDown(event) {
                        var target = angular.element(event.target),
                            ret;

                        if (!target.closest(attrs.dragCancel).length) {
                            start = {
                                x: element.prop('offsetLeft'),
                                y: element.prop('offsetTop')
                            };

                            initialMouse = {
                                x: event.clientX,
                                y: event.clientY
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
                                originalPointerEvents: undefined
                            });

                            setAbsolute();
                            setZIndex(options.zIndex);
                            suspendIframe();

                            window.on('scroll', onScroll);
                            $document.on('mousemove', onMouseMove);
                            $document.on('mouseup', onMouseUp);

                            ret = false;
                        }

                        return ret;
                    }

                    /**
                     * Init options
                     */
                    options = {
                        id: attrs.dragId,
                        relative: '' === attrs.dragRelative,
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

                    /**
                     * Init elements
                     */
                    if (!elemHandle.length) { elemHandle = element; }

                    /**
                     * Init style
                     */
                    setRelative();

                    /**
                     * Load last position
                     */
                    scope.loadPosition(options.id, validatePosition, setElementPosition);

                    window.on('resize', onResize);
                    elemHandle.on('mousedown', onMouseDown);

                    element.on('$destroy', function () {
                        window.off('resize', onResize);
                        elemHandle.off('mousedown', onMouseDown);
                    });
                }
            };
        }]);
});
