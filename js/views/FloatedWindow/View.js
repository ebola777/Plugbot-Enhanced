define('Plugbot/views/FloatedWindow/View', [
    'Plugbot/events/FloatedWindow/Events',
    'Plugbot/events/site/Events',
    'Plugbot/main/Settings',
    'Plugbot/tmpls/FloatedWindow/View',
    'Plugbot/utils/Watcher',
    'Plugbot/views/utils/Ui',
    'Plugbot/views/utils/UiHelpers'
], function (Events, SiteEvents, Settings, Template, Watcher, Ui, UiHelpers) {
    'use strict';

    var View = Backbone.View.extend({
        STATUS: {
            NORMAL: 'normal',
            HIDDEN: 'hidden',
            MINIMIZED: 'minimized'
        },
        MIN_WIDTH: 8 * 20,
        MIN_HEIGHT: 8 * 5,
        MAX_ZINDEX: 10000,
        NARROW_ACTIONS: {
            NONE: 'none',
            HIDDEN: 'hidden',
            CALLSIGN: 'callsign',
            EXPANDED: 'expanded'
        },
        CLASSES_BUTTON: [
            'ui-icon-minus',
            'ui-icon-extlink',
            'ui-icon-close'
        ],
        events: {
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        initialize: function () {
            _.bindAll(this, 'resizeBody', 'resizeTableLayout',
                'onClickControlBoxButton');

            /**
             * Runtime options
             */
            // title is showed as text or callsign
            this.nowNarrowStatus = this.NARROW_ACTIONS.EXPANDED;
            // dispatcher
            this.dispatcher = Events.getDispatcher();
            // template
            this.template = new Template({view: this});
            // the view rendered in the body
            this.bodyView = undefined;
            // elements of control box
            this.elemControlBox = undefined;

            // model events
            this
                .listenTo(this.model, 'change:visible', this.onChangeVisible)
                .listenTo(this.model, 'change:zIndex', this.onChangeZIndex)
                .listenTo(this.model, 'change:x change:y', this.onChangePos)
                .listenTo(this.model, 'change:width change:height',
                    this.onChangeSize)
                .listenTo(this.model, 'change:resizable',
                    this.onChangeResizable)
                .listenTo(this.model, 'change:draggable',
                    this.onChangeDraggable);

            // listens to site events
            this.listenToSiteEvents();
        },
        render: function () {
            // render
            this.template
                .setSelf({
                    textTitle: this.model.get('title')
                })
                .cacheElements()
                .setElementIds();

            // render control boxes
            this.renderControlBoxes();

            // hide first
            this.hide();

            // set css
            this.$el.css({
                position: 'absolute',
                left: this.model.get('x'),
                top: this.model.get('y'),
                width: this.model.get('width'),
                height: this.model.get('height'),
                'min-width': this.MIN_WIDTH,
                'min-height': this.MIN_HEIGHT,
                'z-index': this.model.get('zIndex')
            });

            // set scheme
            this.$el.addClass('scheme-default-plugbot-floated-window');

            // set up body classname
            this.$elBody.addClass(this.model.get('bodyClass'));

            // bind UI events
            this.bindUiEvents();

            // render body view
            this.renderBody();

            return this;
        },
        renderBody: function () {
            var that = this;

            require([this.model.get('view')], function (View) {
                that.bodyView = new View({
                    el: that.$elBody,
                    settings: that.model.get('settings'),
                    moduleWindow: that.model,
                    dispatcherWindow: that.dispatcher
                });

                that.listenToBody();

                that.bodyView.render();
                that.afterRenderBody();
            });
        },
        renderControlBoxes: function () {
            var i, elemControlBox;

            // get elements of control box
            this.elemControlBox = elemControlBox = [
                this.$elMinimize,
                this.$elMaximize,
                this.$elClose
            ];

            // make buttons
            for (i = 0; i !== elemControlBox.length; i += 1) {
                elemControlBox[i].button({
                    icons: {
                        primary: this.CLASSES_BUTTON[i]
                    },
                    text: false
                });

                // add events
                elemControlBox[i].on('click', this.onClickControlBoxButton);
            }
        },
        afterRenderBody: function () {
            // #1: show
            this.show();

            // update title
            this.updateTitle();

            // resize body
            this.resizeBody();

            // resize table layout
            this.resizeTableLayout();

            this.dispatcher.dispatch('AFTER_RENDER');
        },
        show: function (options) {
            this.model.set('visible', true);

            options = options || {};
            _.defaults(options, {
                x: this.model.get('x'),
                y: this.model.get('y')
            });

            this.updatePos(options.x, options.y);

            this.dispatcher.dispatch('SHOW');
        },
        hide: function () {
            this.model.set('visible', false);

            this.dispatcher.dispatch('HIDE');
        },
        resizeBody: function () {
            var that = this,
                fnFit = function (dir) {
                    UiHelpers.fitElement(that.$elBody, that.$el, dir, 0,
                        -that.$elHeader.outerHeight(true));
                };

            // fit body to parent
            if ('auto' !== this.model.get('width')) {
                fnFit('width');
            }

            if ('auto' !== this.model.get('height')) {
                fnFit('height');
            }
        },
        resizeTableLayout: function () {
            var tableLayout = this.model.get('tableLayout');

            if (undefined !== tableLayout) {
                tableLayout.resize();
            }
        },
        updateTitle: function () {
            var NARROW_ACTIONS = this.NARROW_ACTIONS,
                narrowAction = this.model.get('narrowAction'),
                title = this.model.get('title'),
                callsign = this.model.get('callsign'),
                remainingWidth,
                safeDistance = 8;

            switch (this.nowNarrowStatus) {
            case NARROW_ACTIONS.EXPANDED:
                remainingWidth = this._getRemainingHeaderSpace(safeDistance);

                if (remainingWidth < 0) {
                    switch (narrowAction) {
                    case NARROW_ACTIONS.NONE:
                        this.$el.css('min-width',
                            this.$el.width() - remainingWidth);
                        this.nowNarrowStatus = NARROW_ACTIONS.NONE;

                        break;
                    case NARROW_ACTIONS.HIDDEN:
                        this.$elTitle.hide();
                        this.nowNarrowStatus = NARROW_ACTIONS.HIDDEN;

                        break;
                    case NARROW_ACTIONS.CALLSIGN:
                        this.$elTitle.text('<' + callsign + '>');
                        this.nowNarrowStatus = NARROW_ACTIONS.CALLSIGN;

                        break;
                    }
                }

                break;
            case NARROW_ACTIONS.NONE:
                // not used

                break;
            case NARROW_ACTIONS.HIDDEN:
                this.$elTitle.text(title).show();
                remainingWidth = this._getRemainingHeaderSpace(safeDistance);

                if (remainingWidth >= 0) {
                    this.nowNarrowStatus = NARROW_ACTIONS.EXPANDED;
                } else {
                    this.$elTitle.hide();
                }

                break;
            case NARROW_ACTIONS.CALLSIGN:
                this.$elTitle.text(title);
                remainingWidth = this._getRemainingHeaderSpace(safeDistance);

                if (remainingWidth >= 0) {
                    this.nowNarrowStatus = NARROW_ACTIONS.EXPANDED;
                } else {
                    this.$elTitle.text('<' + callsign + '>');
                }

                break;
            }
        },
        updatePos: function (x, y) {
            this.$el.css({
                left: x,
                top: y
            });
        },
        switchResizable: function (en) {
            if (this.model.get('resizable')) {
                if (en) {
                    this.$el.resizable('enable');
                } else {
                    this.$el.resizable('disable');
                }
            }

            return this;
        },
        switchDraggable: function (en) {
            if (this.model.get('draggable')) {
                if (en) {
                    this.$el.draggable('enable');
                } else {
                    this.$el.draggable('disable');
                    this.$el.css('opacity', 1);
                }
            }

            return this;
        },
        bindUiEvents: function () {
            var that = this,
                iframeFixObj,
                watcherTableLayout;

            // resizable
            if (this.model.get('resizable')) {
                this.$el.resizable({
                    containment: 'document',
                    handles: 'n, e, s, w, se',
                    distance: 0,
                    grid: 8,
                    minWidth: Math.max(this.MIN_WIDTH,
                        this.model.get('minWidth')),
                    minHeight: Math.max(this.MIN_HEIGHT,
                        this.model.get('minHeight')),
                    maxWidth: this.model.get('maxWidth'),
                    maxHeight: this.model.get('maxHeight'),
                    start: function (e, ui) {
                        // iframe fix
                        iframeFixObj =
                            UiHelpers.iframeFix(Ui.plugdj.$playback);

                        // use a watcher to trottle actions
                        watcherTableLayout = new Watcher();
                        watcherTableLayout.addFn(that.resizeTableLayout);

                        that.dispatcher.dispatch('RESIZE_START',
                            {e: e, ui: ui});
                    },
                    resize: function (e, ui) {
                        that.updateTitle();
                        that.resizeBody();

                        that.dispatcher.dispatch('RESIZE_NOW', {e: e, ui: ui});
                    },
                    stop: function (e, ui) {
                        // close iframe fix
                        iframeFixObj.close();

                        // close the watcher
                        watcherTableLayout
                            .invoke()
                            .close();

                        // record the size
                        that.model.set({
                            width: ui.size.width,
                            height: ui.size.height
                        });

                        that.dispatcher.dispatch('RESIZE_STOP',
                            {e: e, ui: ui});
                    }
                });
            }

            // draggable
            if (this.model.get('draggable')) {
                this.$el.draggable({
                    containment: 'document',
                    zIndex: this.MAX_ZINDEX,
                    handle: '.header',
                    scroll: true,
                    scrollSensitivity: 8,
                    snap: 'div',
                    snapMode: 'both',
                    snapTolerance: 8,
                    cursor: 'move',
                    start: function (e, ui) {
                        var elem = $(this);

                        elem
                            .css({
                                width: elem.width(),
                                height: elem.height()
                            })
                            .data({
                                // offset difference
                                diffOfs: {
                                    X: ui.position.left - ui.offset.left,
                                    Y: ui.position.top - ui.offset.top
                                }
                            });

                        iframeFixObj =
                            UiHelpers.iframeFix(Ui.plugdj.$playback);

                        that.dispatcher.dispatch('DRAG_START', {e: e, ui: ui});
                    },
                    /**
                     * A bad fix for jquery UI bug caused by zooming in
                     * browser.
                     */
                    drag: function (e, ui) {
                        var diffOfs = $(this).data('diffOfs');

                        ui.position.left -= diffOfs.X;
                        ui.position.top -= diffOfs.Y;

                        // event handler, not a part of the fix
                        that.dispatcher.dispatch('DRAG_NOW', {e: e, ui: ui});
                    },
                    stop: function (e, ui) {
                        iframeFixObj.close();

                        // record size
                        that.model.set({
                            x: ui.position.left,
                            y: ui.position.top
                        });

                        that.dispatcher.dispatch('DRAG_STOP', {e: e, ui: ui});
                    }
                });
            }
        },
        listenToSiteEvents: function () {
            var that = this,
                disprSite = SiteEvents.getDispatcher();

            this.listenTo(disprSite, disprSite.RESIZE, function (options) {
                var ratio = options.ratio,
                    status = that.model.get('status');

                // resize body
                that.resizeBody();

                // re-adjust position
                that.model.set({
                    x: that.model.get('x') * ratio.width,
                    y: that.model.get('y') * ratio.height
                });

                this.dispatcher.dispatch('CHANGE_POS', {
                    x: this.model.get('x'),
                    y: this.model.get('y'),
                    force: true
                });
            });
        },
        listenToBody: function () {
            var that = this,
                disprBody = this.bodyView.dispatcher;

            if (undefined !== disprBody &&
                    undefined !== disprBody.CHANGE_SETTINGS) {
                this.listenTo(disprBody, disprBody.CHANGE_SETTINGS,
                    function (options) {
                        that.dispatcher.dispatch('CHANGE_SETTINGS', options);
                    });
            }
        },
        onMouseEnter: function () {
            this.dispatcher.dispatch('MOUSE_ENTER');
        },
        onMouseLeave: function () {
            this.dispatcher.dispatch('MOUSE_LEAVE');
        },
        onChangeVisible: function () {
            if (this.model.get('visible')) {
                this.$el.show();

                this.resizeBody();
            } else {
                this.$el.hide();
            }
        },
        onChangeZIndex: function () {
            this.$el.css('z-index', this.model.get('zIndex'));
        },
        onChangePos: function () {
            var x = this.model.get('x'),
                y = this.model.get('y');

            this.updatePos(x, y);

            this.dispatcher.dispatch('CHANGE_POS', {
                x: x,
                y: y
            });
        },
        onChangeSize: function () {
            var width = this.model.get('width'),
                height = this.model.get('height');

            this.$el.css({
                width: width,
                height: height
            });

            this.dispatcher.dispatch('CHANGE_SIZE', {
                width: width,
                height: height
            });
        },
        onClickControlBoxButton: function (e) {
            var that = this,
                tmplElem = this.template.elements,
                options = {
                    cancel: false,
                    enabledCallback: false,
                    callback: function () {
                        if (!options.cancel) {
                            that.close();
                        }
                    }
                };

            switch ($(e.currentTarget).data('id')) {
            case tmplElem.elMinimize:
                this.dispatcher.dispatch('CONTROLBOX_MINIMIZE', options);

                break;
            case tmplElem.elMaximize:
                this.dispatcher.dispatch('CONTROLBOX_RESTORE', options);

                break;
            case tmplElem.elClose:
                this.dispatcher.dispatch('CONTROLBOX_CLOSE', options);

                if (!options.enabledCallback) {
                    // TODO
//                    this.hide();
//                    this.model.set('status', 'hidden');
                }

                break;
            }
        },
        _getRemainingHeaderSpace: function (safeDistance) {
            return this.$elHeader.width() -
                this.$elTitle.outerWidth(true) -
                this.$elControlBox.outerWidth(true) -
                safeDistance;
        },
        _closeControlBoxes: function () {
            var i,
                elemControlBox = this.elemControlBox;

            // close control box events
            for (i = 0; i !== elemControlBox.length; i += 1) {
                elemControlBox[i].off();
            }
        },
        close: function () {
            // close control boxes
            this._closeControlBoxes();

            // close body view
            this.bodyView.close();

            this.remove();
        }
    });

    return View;
});
