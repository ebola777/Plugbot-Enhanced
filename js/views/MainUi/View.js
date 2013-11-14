define('Plugbot/views/MainUi/View', [
    'handlebars',
    'Plugbot/utils/APIBuffer',
    'Plugbot/utils/Watcher',
    'Plugbot/views/Ui',
    'Plugbot/models/MainUi/Model',
    'Plugbot/models/MainUi/ItemModel',
    'Plugbot/models/MainUi/ItemCollection',
    'Plugbot/views/MainUi/ItemView'
], function (Handlebars, APIBuffer, Watcher, Ui, MainUiModel, MainUiItemModel,
             MainUiItemCollection, MainUiItemView) {
    'use strict';

    var View = Backbone.View.extend({
        defaults: function () {
            return {
                /**
                 * Options
                 */
                dispatcherWindow: undefined,
                watcherAutoQueue: new Watcher({
                    interval: '2 hz',
                    exitWhenNoCall: false
                }),
                watcherSkipVideo: new Watcher({
                    interval: '1 hz',
                    exitWhenNoCall: false,
                    exitValue: true,
                    exitCall: this.disableSkipVideo
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
                .onClickWoot(Plugbot.settings.ui.autoWoot)
                .onClickQueue(Plugbot.settings.ui.autoQueue)
                .onClickSkipVideo(false);
        },
        el: Ui.plugbot.mainUi,
        templateDialogAsk: Handlebars.compile(
            '    <div title="Exit PlugBot">' +
                '    <p>Exit PlugBot?' +
                '    <\/p>' +
                '<\/div>'
        ),
        events: {
            'click': 'onClick'
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
            var cid = this.model.cid;

            APIBuffer.addListening('auto-woot-' + cid, this, [
                API.DJ_ADVANCE
            ], {
                fnCheck: function () {
                    return Plugbot.settings.ui.autoWoot;
                },
                callback: function () {
                    $(Ui.plugdj.woot).click();
                }
            });

            APIBuffer.addListening('auto-queue-' + cid, this, [
                API.WAIT_LIST_UPDATE
            ], {
                fnCheck: function () {
                    return Plugbot.settings.ui.autoQueue;
                },
                callback: this.enableAutoQueue
            });
        },
        listenToWindow: function () {
            var dispatcherWindow = this.options.dispatcherWindow;

            this.listenTo(dispatcherWindow,
                dispatcherWindow.CONTROLBOX_CLOSE, function (options) {
                    options.enabledCallback = true;
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
                this.onClickWoot(enabled);
                break;
            case 'plugbot-btn-queue':
                this.onClickQueue(enabled);
                break;
            case 'plugbot-btn-skip-video':
                this.onClickSkipVideo(enabled);
                break;
            }
        },
        onClickWoot: function () {
            // not used
            return this;
        },
        onClickQueue: function (en) {
            if (en) {
                this.enableAutoQueue();
            } else {
                this.disableAutoQueue();
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
        enableAutoQueue: function () {
            var ret = API.djJoin();

            if (0 !== ret) {
                this.options.watcherAutoQueue.add(this.fnWatcherAutoQueue);
            }
        },
        disableAutoQueue: function () {
            this.options.watcherAutoQueue.remove(this.fnWatcherAutoQueue);
        },
        enableSkipVideo: function () {
            this.options.lastPlaybackVolume = API.getVolume();
            API.setVolume(0);

            this.options.watcherSkipVideo.add(this.fnWatcherSkipVideo);
        },
        disableSkipVideo: function () {
            var module;

            if (undefined !== this.options.lastPlaybackVolume) {
                module = this.collection.get('plugbot-btn-skip-video');
                module.set('enabled', false);

                API.setVolume(this.options.lastPlaybackVolume);
                this.options.lastPlaybackVolume = undefined;
            }

            this.options.watcherSkipVideo.remove(this.fnWatcherSkipVideo);
        },
        fnWatcherAutoQueue: function () {
            return API.djJoin();
        },
        fnWatcherSkipVideo: function () {
            return API.getTimeRemaining() <= 1;
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
            this.options.watcherAutoQueue.close();
            this.options.watcherSkipVideo.close();
        }
    });

    return View;
});
