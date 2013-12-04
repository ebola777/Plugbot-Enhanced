define('Plugbot/views/FloatedWindow/View', [
    'Plugbot/events/FloatedWindow/Events',
    'Plugbot/models/FloatedWindow/Model',
    'Plugbot/tmpls/FloatedWindow/View',
    'Plugbot/utils/Watcher',
    'Plugbot/views/utils/Ui',
    'Plugbot/views/utils/UiHelpers'
], function (FloatedWindowEvents, FloatedWindowModel,
             FloatedWindowViewTemplate, Watcher, Ui, UiHelpers) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Options
                 */
                dispatcher: _.clone(FloatedWindowEvents),
                /**
                 * Runtime
                 */
                template: undefined,
                // if window has been rendered
                hasRenderedWindow: false,
                // if body has been rendered
                hasRenderedBody: false,
                // the view rendered in the body
                bodyView: undefined,
                // table layout
                tableLayout: undefined,
                // title is showed as text or callsign
                nowNarrowAction: this.NarrowActions.expanded
            };
        },
        events: {
            'mouseenter': 'onMouseEnter',
            'mouseleave': 'onMouseLeave'
        },
        TEMPLATE: FloatedWindowViewTemplate,
        initialize: function () {
            _.bindAll(this);
            _.defaults(this.options, this.defaults());

            // init template
            this.options.template = new this.TEMPLATE({view: this});

            // bind events
            this.listenTo(this.model, 'change', this.onChangeAll);
            this.listenTo(this.model, 'change:visible', this.onChangeVisible);
            this.listenTo(this.model, 'change:zIndex', this.onChangeZIndex);
            this.listenTo(this.model, 'change:x change:y', this.onChangePos);
            this.listenTo(this.model, 'change:width change:height',
                this.onChangeSize);
            this.listenTo(this.model, 'change:resizable',
                this.onChangeResizable);
            this.listenTo(this.model, 'change:draggable',
                this.onChangeDraggable);

            // hide
            this.hide();
        },
        NarrowActions: FloatedWindowModel.prototype.NarrowActions,
        Status: FloatedWindowModel.prototype.Status,
        minWidth: 8 * 20,
        minHeight: 8 * 5,
        buttonClasses: [
            'ui-icon-minus',
            'ui-icon-extlink',
            'ui-icon-close'
        ],
        buttonNames: [
            'minimize',
            'maximize',
            'close'
        ],
        FIXED_ACCURACY: 2,
        render: function () {
            var that = this,
                i,
                elemControlBox;

            // render
            this.options.template
                .setSelf({
                    textTitle: this.model.get('title')
                })
                .cacheElements();

            // set scheme
            this.$el.addClass('scheme-default-plugbot-floated-window');

            // get elements
            elemControlBox = [
                this.$elMinimize,
                this.$elMaximize,
                this.$elClose
            ];

            // make buttons
            for (i = 0; i !== elemControlBox.length; i += 1) {
                elemControlBox[i].button({
                    icons: {
                        primary: this.buttonClasses[i]
                    },
                    text: false
                });

                // assign index
                elemControlBox[i].data('name', this.buttonNames[i]);

                // add events
                elemControlBox[i].on('click', this.onClickControlBoxButton);
            }

            // set up body classname
            this.$elBody.addClass(this.model.get('bodyClass'));

            // set up window attributes
            this.$el.css({
                position: 'absolute',
                left: this.model.get('x'),
                top: this.model.get('y'),
                width: this.model.get('width'),
                height: this.model.get('height'),
                'min-width': this.minWidth,
                'min-height': this.minHeight,
                'z-index': this.model.get('zIndex')
            });

            // bind UI events
            this.bindUiEvents();

            // set up afterRender
            Plugbot.watcher.addFn(function () {
                var ret;

                if (that.$el.is(':visible')) {
                    that.afterRender();
                    that.options.hasRenderedWindow = true;
                    ret = 0;
                }

                return ret;
            });

            // render body view
            require([this.model.get('view')], function (View) {
                that.options.bodyView = new View({
                    el: that.$elBody,
                    modWindow: that.model,
                    dispatcherWindow: that.options.dispatcher
                });
                that.options.bodyView.render();
                that.show();
                that.options.hasRenderedBody = true;
            });

            return this;
        },
        afterRender: function () {
            // update title
            this.updateTitle();

            // resize body
            this.resizeBody();

            // resize table layout
            this.resizeTableLayout();

            this.options.dispatcher.dispatch('AFTER_RENDER');
        },
        show: function () {
            this.model.set('visible', true);
            this.resizeBody();

            this.options.dispatcher.dispatch('SHOW');
        },
        hide: function () {
            this.model.set('visible', false);

            this.options.dispatcher.dispatch('HIDE');
        },
        getBodyView: function () {
            return this.options.bodyView;
        },
        getRemainingHeaderSpace: function (safeDistance) {
            return this.$elHeader.width() -
                this.$elTitle.outerWidth(true) -
                this.$elControlBox.outerWidth(true) -
                safeDistance;
        },
        resizeBody: function () {
            if (this.model.get('visible')) {
                // fit body to parent
                UiHelpers.fitElement(this.$elBody, this.$el, 'both',
                    0, -this.$elHeader.outerHeight(true));
            }
        },
        resizeTableLayout: function () {
            var tableLayout = this.model.get('tableLayout');

            if (undefined !== tableLayout) {
                tableLayout.resize();
            }
        },
        updateTitle: function () {
            var NarrowActions = this.NarrowActions,
                narrowAction = NarrowActions[this.model.get('narrowAction')],
                title = this.model.get('title'),
                callsign = this.model.get('callsign'),
                remainingWidth,
                safeDistance = 8;

            switch (this.options.nowNarrowAction) {
            case NarrowActions.expanded:
                remainingWidth = this.getRemainingHeaderSpace(safeDistance);

                if (remainingWidth < 0) {
                    switch (narrowAction) {
                    case NarrowActions.none:
                        this.$el.css('min-width',
                            this.$el.width() - remainingWidth);
                        this.options.nowNarrowAction = NarrowActions.none;

                        break;
                    case NarrowActions.hidden:
                        this.$elTitle.hide();
                        this.options.nowNarrowAction = NarrowActions.hidden;

                        break;
                    case NarrowActions.callsign:
                        this.$elTitle.text('<' + callsign + '>');
                        this.options.nowNarrowAction = NarrowActions.callsign;

                        break;
                    }
                }

                break;
            case NarrowActions.none:
                // not used

                break;
            case NarrowActions.hidden:
                this.$elTitle.text(title).show();
                remainingWidth = this.getRemainingHeaderSpace(safeDistance);

                if (remainingWidth >= 0) {
                    this.options.nowNarrowAction = NarrowActions.expanded;
                } else {
                    this.$elTitle.hide();
                }

                break;
            case NarrowActions.callsign:
                this.$elTitle.text(title);
                remainingWidth = this.getRemainingHeaderSpace(safeDistance);

                if (remainingWidth >= 0) {
                    this.options.nowNarrowAction = NarrowActions.expanded;
                } else {
                    this.$elTitle.text('<' + callsign + '>');
                }

                break;
            }
        },
        switchResizable: function (en) {
            if (this.model.get('resizable')) {
                if (en) {
                    this.$el.resizable('enable');
                } else {
                    this.$el.resizable('disable');
                }
            }
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
                    minWidth: Math.max(this.minWidth,
                        this.model.get('minWidth')),
                    minHeight: Math.max(this.minHeight,
                        this.model.get('minHeight')),
                    maxWidth: this.model.get('maxWidth'),
                    maxHeight: this.model.get('maxHeight'),
                    start: function (e, ui) {
                        // iframe fix
                        iframeFixObj =
                            UiHelpers.iframeFix($(Ui.plugdj.playback));

                        // resize table layout if it exists
                        if (undefined !== that.model.get('tableLayout')) {
                            watcherTableLayout = new Watcher();
                            watcherTableLayout.addFn(that.resizeTableLayout);
                        }

                        that.options.dispatcher.dispatch('RESIZE_START',
                            [e, ui]);
                    },
                    resize: function (e, ui) {
                        that.updateTitle();

                        // fit body to parent
                        that.resizeBody();

                        that.options.dispatcher.dispatch('RESIZE_NOW',
                            [e, ui]);
                    },
                    stop: function (e, ui) {
                        // iframe fix
                        UiHelpers.removeIframeFix(iframeFixObj);

                        // table layout
                        if (undefined !== watcherTableLayout) {
                            watcherTableLayout.close();
                        }

                        // record the size
                        that.model.set({
                            width: that._getFixed(ui.size.width),
                            height: that._getFixed(ui.size.height)
                        });

                        that.options.dispatcher.dispatch('RESIZE_STOP',
                            [e, ui]);
                    }
                });
            }

            // draggable
            if (this.model.get('draggable')) {
                this.$el.draggable({
                    containment: 'document',
                    zIndex: 10001,
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
                            UiHelpers.iframeFix($(Ui.plugdj.playback));

                        that.options.dispatcher.dispatch('DRAG_START',
                            [e, ui]);
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
                        that.options.dispatcher.dispatch('DRAG_NOW', [e, ui]);
                    },
                    stop: function (e, ui) {
                        UiHelpers.removeIframeFix(iframeFixObj);

                        // record size
                        that.model.set({
                            x: that._getFixed(ui.position.left),
                            y: that._getFixed(ui.position.top)
                        });

                        that.options.dispatcher.dispatch('DRAG_STOP', [e, ui]);
                    }
                });
            }
        },
        onMouseEnter: function () {
            this.options.dispatcher.dispatch('MOUSE_ENTER');
        },
        onMouseLeave: function () {
            this.options.dispatcher.dispatch('MOUSE_LEAVE');
        },
        onChangeVisible: function () {
            if (this.model.get('visible')) {
                this.$el.show();
            } else {
                this.$el.hide();
            }
        },
        onChangeZIndex: function () {
            this.$el.css('z-index', this.model.get('zIndex'));
        },
        onChangePos: function () {
            this.$el.css({
                left: this.model.get('x'),
                top: this.model.get('y')
            });
        },
        onChangeSize: function () {
            this.$el.css({
                width: this.model.get('width'),
                height: this.model.get('height')
            });
        },
        onClickControlBoxButton: function (e) {
            var that = this,
                options = {
                    cancel: false,
                    enabledCallback: false,
                    callback: function () {
                        if (!options.cancel) {
                            that.close();
                        }
                    }
                };

            switch ($(e.currentTarget).data('name')) {
            case 'minimize':
                this.options.dispatcher.dispatch('CONTROLBOX_MINIMIZE',
                    options);

                break;
            case 'maximize':
                this.options.dispatcher.dispatch('CONTROLBOX_MAXIMIZE',
                    options);

                break;
            case 'close':
                this.options.dispatcher.dispatch('CONTROLBOX_CLOSE',
                    options);

                if (!options.enabledCallback) {
                    // TODO
//                    this.hide();
//                    this.model.set('status', 'hidden');
                }

                break;
            }
        },
        onChangeAll: function () {
            this.options.dispatcher.dispatch('CHANGEANY_MODEL');
        },
        _getFixed: function (num) {
            return +num.toFixed(this.FIXED_ACCURACY);
        },
        close: function () {
            this.remove();

            // close body view
            this.options.bodyView.close();
        }
    });

    return View;
});
