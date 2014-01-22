define('Plugbot/views/Userlist/View', [
    'Plugbot/base/SubView',
    'Plugbot/main/mgrs/ResourceManager',
    'Plugbot/models/Userlist/Model',
    'Plugbot/tmpls/Userlist/View',
    'Plugbot/utils/Ticker',
    'Plugbot/views/layout/TableLayout',
    'Plugbot/views/Userlist/HeadView',
    'Plugbot/views/Userlist/UsersView'
], function (BaseSubView, ResourceManager, Model, Template, Ticker,
             TableLayout, HeadView, UsersView) {
    'use strict';

    var View = BaseSubView.extend({
        TICKER_IDS: {
            UPDATE_USERS_REAR_SPACE: 'update-users-rear-space'
        },
        options: function () {
            return {
                moduleWindow: undefined,
                dispatcherWindow: undefined
            };
        },
        initialize: function () {
            var tmpl;

            _.bindAll(this, 'renderHead', 'renderUsers');

            // parent class
            this.parent = BaseSubView.prototype;
            this.parent.initialize.call(this);

            // set model
            this.model = new Model();

            // runtime options
            this.renderOverElapsed = 5;
            this.ticker = new Ticker({interval: 'optimal'});
            this.pendingRenderHead = false;
            this.pendingRenderUsers = false;
            this.template = tmpl = new Template({view: this});
            this.tableLayout = new TableLayout({
                el: this.$el,
                display: 'column',
                classes: [
                    tmpl.getElement('clsHead'),
                    tmpl.getElement('clsUsers')
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

            // listen to API
            this.listenToAPI();
        },
        render: function () {
            // render
            this.template
                .setHtml()
                .cacheElements();

            // set scheme
            this.$el
                .addClass('scheme-default-plugbot-userlist');

            // let window know table layout
            this.options.moduleWindow.set('tableLayout', this.tableLayout);

            // render table layout
            this.tableLayout.render();

            // render sub-views
            this
                .subViews({
                    head: new HeadView({
                        el: this.$elHead
                    }),
                    users: new UsersView({
                        el: this.$elUsers
                    })
                })
                .renderSub();

            // listen to window events
            this.listenToWindow();

            return this;
        },
        renderHead: function () {
            this.renderSub('head');

            return this;
        },
        renderUsers: function () {
            this.renderSub('users');

            return this;
        },
        updateListRearSpace: function () {
            var that = this;

            this.ticker.add(this.TICKER_IDS.UPDATE_USERS_REAR_SPACE,
                function () {
                    that.$elUsers.css('padding-bottom',
                        0.5 * that.$elWrapUsers.height());
                });
        },
        listenToAPI: function () {
            var that = this,
                cid = this.model.cid,
                bufferAPI = ResourceManager.get('API-buffer'),
                fnCheck = function (part) {
                    var ret;

                    if (that.options.moduleWindow.get('visible')) {
                        if (API.getTimeElapsed() >= that.renderOverElapsed) {
                            ret = true;
                        } else {
                            ret = false;
                        }
                    } else {
                        switch (part) {
                        case 'head':
                            that.pendingRenderHead = true;
                            break;
                        case 'users':
                            that.pendingRenderUsers = true;
                            break;
                        }

                        ret = false;
                    }

                    return ret;
                };

            bufferAPI.addListening('head:' + cid, this, [
                API.WAIT_LIST_UPDATE,
                API.DJ_UPDATE
            ], {
                fnCheck: function () {
                    return fnCheck('head');
                },
                callback: this.renderHead
            });

            bufferAPI.addListening('users:' + cid, this, [
                API.VOTE_UPDATE,
                API.CURATE_UPDATE,
                API.USER_JOIN,
                API.USER_LEAVE
            ], {
                fnCheck: function () {
                    return fnCheck('users');
                },
                callback: this.renderUsers
            });
        },
        listenToWindow: function () {
            var that = this,
                moduleWindow = this.options.moduleWindow,
                disprWindow = this.options.dispatcherWindow;

            this.listenTo(moduleWindow, 'change:visible', function (mod) {
                if (mod.get('visible')) {
                    that.updateListRearSpace();

                    if (that.pendingRenderHead) {
                        that.renderHead();
                        that.pendingRenderHead = false;
                    }

                    if (that.pendingRenderUsers) {
                        that.renderUsers();
                        that.pendingRenderUsers = false;
                    }
                }
            });

            this
                .listenTo(disprWindow, disprWindow.AFTER_RENDER,
                    function () {
                        that.updateListRearSpace();
                    })
                .listenTo(disprWindow, disprWindow.RESIZE_NOW,
                    function () {
                        that.updateListRearSpace();
                    })
                .listenTo(disprWindow, disprWindow.RESIZE_START,
                    function () {
                        that.updateListRearSpace();
                    });
        },
        close: function () {
            // close utilities
            this.ticker.close();

            // close views
            this.tableLayout.close();

            // close sub-views
            this.closeAllSubViews();

            this.remove();
        }
    });

    return View;
});
