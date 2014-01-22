define('Plugbot/views/MainUi/View', [
    'handlebars',
    'Plugbot/events/MainUi/Events',
    'Plugbot/main/mgrs/ResourceManager',
    'Plugbot/models/MainUi/Model',
    'Plugbot/tmpls/MainUi/View',
    'Plugbot/utils/API',
    'Plugbot/utils/Watcher',
    'Plugbot/views/utils/Ui'
], function (Handlebars, Events, ResourceManager, Model, Template, UtilsAPI,
             Watcher, Ui) {
    'use strict';

    var View = Backbone.View.extend({
        FADING_OVER_THRESHOLD: 5,
        WATCHER_IDS: {
            AUTO_WOOT: 'auto-woot',
            AUTO_JOIN: 'auto-join',
            SKIP_VIDEO: 'skip-video',
            DIALOG_PREVIEW_VISIBLE: 'dialog-preview-visible',
            SKIP_VIDEO_AGAIN: 'skip-video-again'
        },
        TEMPLATE_DIALOG_ASK: Handlebars.compile(
            '    <div title="Exit">' +
                '    <p>Exit Plugbot Enhanced?' +
                '    <\/p>' +
                '<\/div>'
        ),
        options: function () {
            return {
                settings: {},
                moduleWindow: undefined,
                dispatcherWindow: undefined
            };
        },
        initialize: function () {
            _.bindAll(this, 'enableAutoWoot', 'disableAutoWoot',
                'enableAutoJoin', 'disableAutoJoin', 'enableSkipVideo',
                'disableSkipVideo', 'resumeSkipVideo');

            // model
            this.model = new Model(this.options.settings);

            // runtime options
            this.dispatcher = Events.getDispatcher();
            this.lastVolume = undefined;
            this.watcher = new Watcher({interval: '1 hz'});
            this.watcherSkipVideoAgain = new Watcher();
            this.pendingUpdate = false;
            this.elemDialogAsk = undefined;
            this.template = new Template({view: this});

            // model events
            this.listenTo(this.model, 'change', this.onChangeAny);

            // listen to window events
            this.listenToWindow();

            // listen to API
            this.listenToAPI();
        },
        el: Ui.plugbot.mainUi,
        render: function () {
            // render dialog
            this.elemDialogAsk = $(this.TEMPLATE_DIALOG_ASK());

            // render template
            this.template
                .setHtml()
                .cacheElements()
                .delegateEvents()
                .setElementIds();

            // trigger button actions
            this
                .onClickAutoWoot(this.model.get('autoWoot'))
                .onClickAutoJoin(this.model.get('autoJoin'))
                .onClickSkipVideo(this.model.get('skipVideo'));

            // update the view
            this.update();

            // watch activities
            this._watchActivities();

            return this;
        },
        update: function () {
            var classEnabled = this.template.getClass('enabled');

            // remove class from all
            this.$clsItems.removeClass(classEnabled);

            // add class individually
            if (this.model.get('autoWoot')) {
                this.$elAutoWoot.addClass(classEnabled);
            }

            if (this.model.get('autoJoin')) {
                this.$elAutoJoin.addClass(classEnabled);
            }

            if (this.model.get('skipVideo')) {
                this.$elSkipVideo.addClass(classEnabled);
            }
        },
        listenToAPI: function () {
            var that = this,
                cid = this.model.cid,
                bufferAPI = ResourceManager.get('API-buffer');

            bufferAPI.addListening('auto-woot:' + cid, this, [
                API.DJ_ADVANCE
            ], {
                fnCheck: function () {
                    return that.model.get('autoWoot');
                },
                callback: that.enableAutoWoot
            });

            bufferAPI.addListening('auto-join:' + cid, this, [
                API.WAIT_LIST_UPDATE
            ], {
                fnCheck: function () {
                    return that.model.get('autoJoin');
                },
                callback: this.enableAutoJoin
            });

            bufferAPI.addListening('skip-video:' + cid, this, [
                API.DJ_ADVANCE
            ], {
                fnCheck: function () {
                    // disable resuming volume in last song
                    that.watcher.remove(that.WATCHER_IDS.SKIP_VIDEO);

                    return that.model.get('skipVideo');
                },
                callback: this.resumeSkipVideo
            });
        },
        listenToWindow: function () {
            var that = this,
                moduleWindow = this.options.moduleWindow,
                disprWindow = this.options.dispatcherWindow;

            this
                .listenTo(moduleWindow, 'change:visible', function (mod) {
                    if (mod.get('visible')) {
                        if (that.pendingUpdate) {
                            that.update();
                            that.pendindUpdate = false;
                        }
                    }
                })
                .listenTo(disprWindow, disprWindow.CONTROLBOX_CLOSE,
                    function (options) {
                        options.enabledCallback = true;

                        // show dialog
                        that.elemDialogAsk.dialog({
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
        onChangeAny: function (e) {
            var changed = e.changedAttributes();

            // view
            if (this.options.moduleWindow.get('visible')) {
                this.update();
            } else {
                this.pendingUpdate = true;
            }

            this.dispatcher.dispatch('CHANGE_SETTINGS', changed);
        },
        onClickItem: function (e) {
            var elem = $(e.currentTarget),
                tmplElem = this.template.elements,
                classEnabled = this.template.getClass('enabled'),
                en = !elem.hasClass(classEnabled);

            switch (elem.data('id')) {
            case tmplElem.elAutoWoot:
                this.model.set('autoWoot', en);
                this.onClickAutoWoot(en);
                break;
            case tmplElem.elAutoJoin:
                this.model.set('autoJoin', en);
                this.onClickAutoJoin(en);
                break;
            case tmplElem.elSkipVideo:
                this.model.set('skipVideo', en);
                this.onClickSkipVideo(en);
                break;
            }
        },
        onClickAutoWoot: function (en) {
            if (en) {
                this.enableAutoWoot();
            } else {
                this.disableAutoWoot();
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
        enableAutoWoot: function () {
            var vote = API.getUser().vote,
                undecided = UtilsAPI.USER.VOTE.UNDECIDED,
                elemWoot =  Ui.plugdj.$woot,
                fnAutoWoot = function () {
                    var ret;

                    elemWoot.click();
                    vote = API.getUser().vote;

                    if (undecided !== vote) {
                        ret = 0;
                    }

                    return ret;
                };

            if (undecided === vote) {
                elemWoot.click();
                vote = API.getUser().vote;

                if (undecided === vote) {
                    this.watcher.add(this.WATCHER_IDS.AUTO_WOOT, fnAutoWoot);
                }
            }
        },
        disableAutoWoot: function () {
            this.watcher.remove(this.WATCHER_IDS.AUTO_WOOT);
        },
        enableAutoJoin: function () {
            var ret = API.djJoin();

            if (0 !== ret) {
                this.watcher.add(this.WATCHER_IDS.AUTO_JOIN, function () {
                    return API.djJoin();
                });
            }
        },
        disableAutoJoin: function () {
            this.watcher.remove(this.WATCHER_IDS.AUTO_JOIN);
        },
        enableSkipVideo: function () {
            var VOLUME_MUTE = UtilsAPI.PLAYBACK.VOLUME.MUTE;

            this.watcher.remove(this.WATCHER_IDS.SKIP_VIDEO);
            this.lastVolume = API.getVolume();
            API.setVolume(VOLUME_MUTE);
        },
        disableSkipVideo: function () {
            var lastVolume = this.lastVolume;

            // stop trying to set volume
            this.watcher.remove(this.WATCHER_IDS.SKIP_VIDEO);
            this.watcherSkipVideoAgain.remove(
                this.WATCHER_IDS.SKIP_VIDEO_AGAIN
            );

            // resume last volume (only call once)
            if (undefined !== lastVolume) {
                if (0 === API.getVolume()) {
                    API.setVolume(lastVolume);
                    this.lastVolume = undefined;
                }
            }
        },
        resumeSkipVideo: function () {
            var MAX_VOLUME = UtilsAPI.PLAYBACK.VOLUME.MAX,
                lastVolume = this.lastVolume,
                nearbyVolume;

            // decide nearby volume
            if (MAX_VOLUME === lastVolume) {
                nearbyVolume = MAX_VOLUME - 1;
            } else {
                nearbyVolume = lastVolume + 1;
            }

            // disable skip-video
            this.model.set('skipVideo', false);
            this.disableSkipVideo();

            if (0 !== lastVolume) {
                // keep setting volume to last one, until user changes it
                this.watcher.add(this.WATCHER_IDS.SKIP_VIDEO, function () {
                    var ret, volume = API.getVolume();

                    if (volume === lastVolume) {
                        API.setVolume(nearbyVolume);
                        API.setVolume(lastVolume);
                    } else {
                        ret = 0;
                    }

                    return ret;
                });
            }
        },
        _watchActivities: function () {
            var that = this,
                VOLUME_MUTE = UtilsAPI.PLAYBACK.VOLUME.MUTE,
                isSkipAgain = false,
                isFadingOver,
                listVolume,
                fnSkipVideoAgain = function () {
                    var vol = API.getVolume(),
                        ret;

                    if (!isFadingOver) {
                        // record the volume
                        listVolume.push(vol);
                        if (listVolume.length > that.FADING_OVER_THRESHOLD) {
                            listVolume.splice(0, 1);
                        }

                        if (listVolume.length === that.FADING_OVER_THRESHOLD) {
                            // if every element has the same value
                            if (_.every(listVolume, function (num) {
                                    return num === listVolume[0] && 0 !== num;
                                })) {
                                isFadingOver = true;
                                API.setVolume(VOLUME_MUTE);
                                this.invoke();
                            }
                        }
                    } else {
                        if (0 === vol) {
                            API.setVolume(VOLUME_MUTE);
                        } else {
                            ret = 0;
                        }
                    }

                    return ret;
                };

            this.watcher.add(this.WATCHER_IDS.DIALOG_PREVIEW_VISIBLE,
                function () {
                    var uiDialogPreview = $(Ui.plugdj.dialogPreview),
                        isSkipingVideo = that.model.get('skipVideo');

                    if (uiDialogPreview.is(':visible')) {
                        // stop keeping volume to zero
                        that.watcherSkipVideoAgain.remove(
                            that.WATCHER_IDS.SKIP_VIDEO_AGAIN
                        );

                        // is skipping video?
                        isSkipAgain = isSkipingVideo;
                    } else {
                        // skip again?
                        if (isSkipAgain) {
                            isFadingOver = false;
                            listVolume = [];

                            // keep setting volume to zero upon fading is over
                            // until user changes volume
                            that.watcherSkipVideoAgain.add(
                                that.WATCHER_IDS.SKIP_VIDEO_AGAIN,
                                fnSkipVideoAgain
                            );

                            isSkipAgain = false;
                        }
                    }
                });
        },
        _unwatchActivities: function () {
            this.watcher.remove(this.WATCHER_IDS.DIALOG_PREVIEW_VISIBLE);
            this.watcherSkipVideoAgain
                .remove(this.WATCHER_IDS.SKIP_VIDEO_AGAIN);
        },
        close: function () {
            // close watchers
            this.watcher.close();
            this.watcherSkipVideoAgain.close();

            this._unwatchActivities();

            this.remove();
        }
    });

    return View;
});
