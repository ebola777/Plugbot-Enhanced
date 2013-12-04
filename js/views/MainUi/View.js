define('Plugbot/views/MainUi/View', [
    'handlebars',
    'Plugbot/colls/MainUi/ItemCollection',
    'Plugbot/models/MainUi/ItemModel',
    'Plugbot/models/MainUi/Model',
    'Plugbot/utils/API',
    'Plugbot/utils/APIBuffer',
    'Plugbot/utils/Watcher',
    'Plugbot/views/MainUi/ItemView',
    'Plugbot/views/utils/Ui'
], function (Handlebars, MainUiItemCollection, MainUiItemModel, MainUiModel,
             UtilsAPI, APIBuffer, Watcher, MainUiItemView, Ui) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Options
                 */
                dispatcherWindow: undefined,
                watcherAutoJoin: new Watcher({
                    interval: '1 hz'
                }),
                watcherSkipVideo: new Watcher({
                    interval: '1 hz'
                }),
                /**
                 * Runtime
                 */
                views: {},
                elemDialogAsk: undefined,
                lastPlaybackVolume: undefined
            };
        },
        model: new MainUiModel(),
        initialize: function () {
            _.bindAll(this);

            // pull defaults to options
            _.defaults(this.options, this.defaults());

            // set model collection
            this.collection = new MainUiItemCollection();

            // bind events
            this.listenTo(this.collection, 'add', this.addOne);

            // listen to window events
            this.listenToWindow();

            // listen to API
            this.listenToAPI();

            // trigger button actions
            this
                .onClickAutoWoot(Plugbot.settings.mainUi.autoWoot)
                .onClickAutoJoin(Plugbot.settings.mainUi.autoJoin)
                .onClickSkipVideo(false);
        },
        el: Ui.plugbot.mainUi,
        templateDialogAsk: Handlebars.compile(
            '    <div title="Exit">' +
                '    <p>Exit Plugbot Enhanced?' +
                '    <\/p>' +
                '<\/div>'
        ),
        events: {
            'click p': 'onClick'
        },
        render: function () {
            var i, newModel, data = this.model.get('data');

            this.options.elemDialogAsk = $(this.templateDialogAsk());

            for (i = 0; i !== data.length; i += 1) {
                // generate models
                newModel = new MainUiItemModel(data[i]);
                this.collection.add(newModel);
            }

            return this;
        },
        addOne: function (mod) {
            var newView = new MainUiItemView({
                model: mod
            });

            this.options.views[mod.id] = newView;

            this.$el.append(newView.render().el);
        },
        listenToAPI: function () {
            var that = this,
                cid = this.model.cid;

            APIBuffer.addListening('auto-woot-' + cid, this, [
                API.DJ_ADVANCE
            ], {
                fnCheck: function () {
                    return Plugbot.settings.mainUi.autoWoot;
                },
                callback: function () {
                    $(Ui.plugdj.woot).click();
                }
            });

            APIBuffer.addListening('auto-join-' + cid, this, [
                API.WAIT_LIST_UPDATE
            ], {
                fnCheck: function () {
                    return Plugbot.settings.mainUi.autoJoin;
                },
                callback: this.enableAutoJoin
            });

            APIBuffer.addListening('skip-video-' + cid, this, [
                API.DJ_ADVANCE
            ], {
                fnCheck: function () {
                    that.options.watcherSkipVideo.remove('skip-video');

                    return that.collection.get('plugbot-btn-skip-video')
                        .get('enabled');
                },
                callback: function () {
                    var lastVolume = that.options.lastPlaybackVolume,
                        nearbyVolume;

                    if (100 === nearbyVolume) {
                        nearbyVolume = 99;
                    } else {
                        nearbyVolume = lastVolume + 1;
                    }

                    that.disableSkipVideo();

                    that.options.watcherSkipVideo.add('skip-video', {
                        call: function () {
                            var ret, volume = API.getVolume();

                            if (volume === lastVolume) {
                                API.setVolume(nearbyVolume);
                                API.setVolume(lastVolume);
                            } else {
                                ret = 0;
                            }

                            return ret;
                        }
                    });
                }
            });
        },
        listenToWindow: function () {
            var dispatcherWindow = this.options.dispatcherWindow;

            this.listenTo(dispatcherWindow,
                dispatcherWindow.CONTROLBOX_CLOSE, function (options) {
                    options.enabledCallback = true;

                    // show dialog
                    this.options.elemDialogAsk.dialog({
                        modal: true,
                        draggable: false,
                        resizable: false,
                        buttons: {
                            'OK': function () {
                                options.callback();
                                Plugbot.close();
                                $(this).dialog('close');
                            },
                            'Cancel': function () {
                                options.cancel = true;
                                options.callback();
                                $(this).dialog('close');
                            }
                        }
                    });
                });
        },
        onClick: function (e) {
            var id = e.target.id,
                model = this.collection.get(id),
                enabled = model.get('enabled');

            // handle what to do
            switch (id) {
            case 'plugbot-btn-woot':
                this.onClickAutoWoot(enabled);
                break;
            case 'plugbot-btn-join':
                this.onClickAutoJoin(enabled);
                break;
            case 'plugbot-btn-skip-video':
                this.onClickSkipVideo(enabled);
                break;
            }
        },
        onClickAutoWoot: function (en) {
            if (en) {
                if (UtilsAPI.USER.VOTE.UNDECIDED === API.getUser().vote) {
                    $(Ui.plugdj.woot).click();
                }
            }

            return this;
        },
        onClickAutoJoin: function (en) {
            if (en) {
                this.enableAutoJoin();
            } else {
                this.disableAutoJoin();
            }

            return this;
        },
        onClickSkipVideo: function (en) {
            if (en) {
                this.enableSkipVideo();
            } else {
                this.disableSkipVideo();
            }

            return this;
        },
        enableAutoJoin: function () {
            var ret = API.djJoin();

            if (0 !== ret) {
                this.options.watcherAutoJoin.add('auto-join', {
                    call: function () {
                        return API.djJoin();
                    }
                });
            }
        },
        disableAutoJoin: function () {
            this.options.watcherAutoJoin.remove('auto-join');
        },
        enableSkipVideo: function () {
            this.options.watcherSkipVideo.remove('skip-video');
            this.options.lastPlaybackVolume = API.getVolume();
            API.setVolume(0);
        },
        disableSkipVideo: function () {
            var module;

            if (undefined !== this.options.lastPlaybackVolume) {
                module = this.collection.get('plugbot-btn-skip-video');
                module.set('enabled', false);

                if (0 === API.getVolume()) {
                    API.setVolume(this.options.lastPlaybackVolume);
                    this.options.lastPlaybackVolume = undefined;
                }
            }
        },
        close: function () {
            var key, views = this.options.views;

            this.remove();

            // remove collection
            this.collection.close();

            // remove views
            for (key in views) {
                if (views.hasOwnProperty(key)) {
                    views[key].close();
                }
            }

            // close watchers
            this.options.watcherAutoJoin.close();
            this.options.watcherSkipVideo.close();
        }
    });

    return View;
});
