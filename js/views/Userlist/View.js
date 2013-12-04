define('Plugbot/views/Userlist/View', [
    'Plugbot/models/Userlist/Model',
    'Plugbot/tmpls/Userlist/View',
    'Plugbot/utils/APIBuffer',
    'Plugbot/utils/Ticker',
    'Plugbot/views/layout/TableLayout',
    'Plugbot/views/Userlist/HeadView',
    'Plugbot/views/Userlist/UsersView'
], function (UserlistModel, UserlistViewTemplate, APIBuffer, Ticker,
             TableLayout, UserlistHeadView, UserlistUsersView) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Options
                 */
                modWindow: undefined,
                dispatcherWindow: undefined,
                renderOverElapsed: 5,
                ticker: new Ticker({interval: '12 hz'}),
                /**
                 * Runtime
                 */
                template: undefined,
                pendingRenderHead: false,
                pendingRenderList: false,
                tableLayout: undefined,
                viewHead: undefined,
                viewList: undefined
            };
        },
        model: new UserlistModel(),
        TEMPLATE: UserlistViewTemplate,
        initialize: function () {
            _.bindAll(this);
            _.defaults(this.options, this.defaults());

            // init template
            this.options.template = new this.TEMPLATE({view: this});

            // listen to API
            this.listenToAPI();
        },
        render: function () {
            this.model.updateAll();

            // render
            this.options.template
                .setHtml()
                .cacheElements();

            // set scheme
            this.$el
                .addClass('scheme-default-plugbot-userlist');

            // create a table layout
            this.options.tableLayout = new TableLayout({
                el: this.$el,
                display: 'column',
                classes: [
                    'row-head',
                    'row-list'
                ],
                values: [
                    0,
                    0
                ],
                styles: [
                    'auto',
                    '?'
                ],
                grows: [
                    0,
                    1
                ]
            });

            // let window know table layout
            this.options.modWindow.set('tableLayout',
                this.options.tableLayout);

            // init views
            this.options.viewHead = new UserlistHeadView({
                model: this.model,
                el: this.$elHead
            });
            this.options.viewList = new UserlistUsersView({
                model: this.model,
                el: this.$elList
            });

            // table layout
            this.options.tableLayout.render();
            // head
            this.options.viewHead.render();
            // users
            this.options.viewList.render();

            // resize table layout
            this.options.tableLayout.resize();

            // listen to window events
            this.listenToWindow();

            return this;
        },
        renderHead: function () {
            this.model.updateWaitList();
            this.options.viewHead.render();

            this.options.pendingRenderHead = false;

            return this;
        },
        renderList: function () {
            this.model.updateUsers();
            this.options.viewList.render();

            this.options.pendingRenderList = false;

            return this;
        },
        listenToAPI: function () {
            var that = this,
                cid = this.model.cid,
                fnCheck = function (com) {
                    var ret;

                    if (that.options.modWindow.get('visible')) {
                        if (API.getTimeElapsed() >=
                                that.options.renderOverElapsed) {
                            ret = true;
                        } else {
                            ret = false;
                        }
                    } else {
                        switch (com) {
                        case 'head':
                            that.options.pendingRenderHead = true;
                            break;
                        case 'list':
                            that.options.pendingRenderList = true;
                            break;
                        }

                        ret = false;
                    }

                    return ret;
                };

            APIBuffer.addListening('head-' + cid, this, [
                API.WAIT_LIST_UPDATE,
                API.DJ_UPDATE
            ], {
                fnCheck: function () {
                    return fnCheck('head');
                },
                callback: this.renderHead
            });

            APIBuffer.addListening('list-' + cid, this, [
                API.VOTE_UPDATE,
                API.USER_JOIN,
                API.USER_LEAVE
            ], {
                fnCheck: function () {
                    return fnCheck('list');
                },
                callback: this.renderList
            });
        },
        listenToWindow: function () {
            var that = this,
                modWindow = this.options.modWindow,
                dispatcherWindow = this.options.dispatcherWindow;

            this.listenTo(modWindow, 'change:visible', function () {
                if (modWindow.get('visible')) {
                    that.updateUsersRearSpace();

                    if (that.options.pendingRenderHead) {
                        that.renderHead();
                    }

                    if (that.options.pendingRenderList) {
                        that.renderList();
                    }
                }
            });

            this
                .listenTo(dispatcherWindow, dispatcherWindow.AFTER_RENDER,
                    function () {
                        that.updateUsersRearSpace();
                    })
                .listenTo(dispatcherWindow, dispatcherWindow.RESIZE_NOW,
                    function () {
                        that.updateUsersRearSpace();
                    })
                .listenTo(dispatcherWindow, dispatcherWindow.RESIZE_START,
                    function () {
                        that.updateUsersRearSpace();
                    });
        },
        updateUsersRearSpace: function () {
            var that = this;

            this.options.ticker.add('update-users-rear-space', function () {
                that.$elList.css('padding-bottom',
                    0.5 * that.$elWrapList.height());
            });
        },
        /**
         * Disposing
         */
        close: function () {
            this.remove();

            // close views
            this.options.tableLayout.close();
            this.options.viewHead.close();
            this.options.viewList.close();

            // close utilities
            this.options.ticker.close();
        }
    });

    return View;
});
