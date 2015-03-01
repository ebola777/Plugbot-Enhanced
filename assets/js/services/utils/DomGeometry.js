/*global HTMLElement */

define(["plugbot/services/module", "angular"], function (module, angular) {
    "use strict";

    module.factory("DomGeometry", ["$window", function ($window) {
        return {
            isContainRect: function (targetRect, sourceRect) {
                var ret = {
                    x: false,
                    y: false
                };

                if (targetRect.left - sourceRect.left <= 0 &&
                    sourceRect.right - targetRect.right <= 0) {
                    ret.x = true;
                }

                if (targetRect.top - sourceRect.top <= 0 &&
                    sourceRect.bottom - targetRect.bottom <= 0) {
                    ret.y = true;
                }

                return ret;
            },
            isIntersectRect: function (targetRect, sourceRect) {
                return (
                targetRect.left - sourceRect.right < 0 &&
                sourceRect.left - targetRect.right < 0 &&
                targetRect.top - sourceRect.bottom < 0 &&
                sourceRect.top - targetRect.bottom < 0);
            },
            isContain: function (target, source) {
                var targetRect = this.getBoundingRect(target);
                var sourceRect = this.getBoundingRect(source);

                return this.isContainRect(targetRect, sourceRect);
            },
            isIntersect: function (target, source) {
                var targetRect = this.getBoundingRect(target);
                var sourceRect = this.getBoundingRect(source);

                return this.isIntersectRect(targetRect, sourceRect);
            },
            getSnap: function (target, source, snapMode, tolerance) {
                var i;
                var distance;
                var targetRect = this.getBoundingRect(target);
                var sourceRect = this.getBoundingRect(source);
                var propsX = ["left", "right"];
                var propsY = ["top", "bottom"];
                var indexes = [];
                var ret = {
                    x: 0,
                    y: 0
                };

                if (snapMode === "inner" || snapMode === "both") {
                    indexes.push([0, 0], [1, 1]);
                }

                if (snapMode === "outer" || snapMode === "both") {
                    indexes.push([0, 1], [1, 0]);
                }

                for (i = 0; i < indexes.length; i += 1) {
                    distance = targetRect[propsX[indexes[i][0]]] - sourceRect[propsX[indexes[i][1]]];
                    if (Math.abs(distance) <= tolerance &&
                        targetRect.top <= sourceRect.bottom &&
                        sourceRect.top <= targetRect.bottom) {
                        ret.x += distance;
                    }

                    distance = targetRect[propsY[indexes[i][0]]] - sourceRect[propsY[indexes[i][1]]];
                    if (Math.abs(distance) <= tolerance &&
                        targetRect.left <= sourceRect.right &&
                        sourceRect.left <= targetRect.right) {
                        ret.y += distance;
                    }
                }

                return ret;
            },
            getRestraint: function (target, source) {
                var targetRect = this.getBoundingRect(target);
                var sourceRect = this.getBoundingRect(source);
                var isContain = this.isContainRect(targetRect, sourceRect);
                var ret = sourceRect;

                if (!isContain.x) {
                    if (sourceRect.left < targetRect.left) {
                        ret.left = targetRect.left;
                        ret.right = targetRect.left + sourceRect.width;
                    } else {
                        ret.right = targetRect.right;
                        ret.left = targetRect.right - sourceRect.width;
                    }
                }

                if (!isContain.y) {
                    if (sourceRect.top < targetRect.top) {
                        ret.top = targetRect.top;
                        ret.bottom = targetRect.top + sourceRect.height;
                    } else {
                        ret.bottom = targetRect.bottom;
                        ret.top = targetRect.bottom - sourceRect.height;
                    }
                }

                return ret;
            },
            offsetRect: function (target, source) {
                source = _.clone(source);
                _.defaults(source, {
                    x: 0,
                    y: 0
                });

                target.left += source.x;
                target.right += source.x;
                target.top += source.y;
                target.bottom += source.y;
            },
            getBoundingRect: function (element) {
                var window = angular.element($window);
                var rect;
                var props = ["left", "right", "top", "bottom", "width", "height"];
                var scroll = {
                    x: window.scrollLeft(),
                    y: window.scrollTop()
                };

                if (element instanceof angular.element) {
                    rect = _.pick(element[0].getBoundingClientRect(), props);

                    this.offsetRect(rect, scroll);
                } else if (element instanceof HTMLElement) {
                    rect = _.pick(element.getBoundingClientRect(), props);

                    this.offsetRect(rect, scroll);
                } else {
                    rect = element;
                }

                return rect;
            }
        };
    }]);
});
