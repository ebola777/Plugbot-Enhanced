define('Plugbot/views/MainUi/View', [
    'handlebars',
    'Plugbot/main/Settings',
    'Plugbot/models/MainUi/Model',
    'Plugbot/tmpls/MainUi/View',
    'Plugbot/utils/API',
    'Plugbot/utils/APIBuffer',
    'Plugbot/utils/Watcher',
    'Plugbot/views/utils/Ui'
], function (Handlebars, Settings, Model, Template, UtilsAPI, APIBuffer,
             Watcher, Ui) {
    'use strict';

    var View = Backbone.View.extend({
        options: function () {
            return {
                moduleWindow: undefined,
                dispatcherWindow: undefined
            };
        },
        initialize: function () {
            _.bindAll(this, 'enableAutoWoot', 'disableAutoWoot',
                'enableAutoJoin', 'disableAutoJoin', 'enableSkipVideo',
                'disableSkipVideo');

            // model
            this.model = new Model();

            // runtime options
            this.lastVolume = undefined;
            this.watcher = new Watcher({interval: '1 hz'});
            this.pendingUpdate = false;
            this.elemDialogAsk = undefined;
            this.templateDialogAsk = Handlebars.compile(
                '    <div title="Exit">' +
                    '    <p>Exit Plugbot Enhanced?' +
                    '    <\/p>' +
                    '<\/div>'
            );
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
            this.elemDialogAsk = $(this.templateDialogAsk());

            // render template
            this.template
                .setHtml()
                .cacheElements()
                .delegateEvents()
                .setElementIds();

            // update model
            this.model.update();

            // trigger button actions
            this
                .onClickAutoWoot(this.model.get('autoWoot'))
                .onClickAutoJoin(this.model.get('autoJoin'))
                .onClickSkipVideo(this.model.get('skipVideo'));

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
                cid = this.model.cid;

            APIBuffer.addListening('auto-woot:' + cid, this, [
                API.DJ_ADVANCE
            ], {
                fnCheck: function () {
                    return that.model.get('autoWoot');
                },
                callback: that.enableAutoWoot
            });

            APIBuffer.addListening('auto-join:' + cid, this, [
                API.WAIT_LIST_UPDATE
            ], {
                fnCheck: function () {
                    return that.model.get('autoJoin');
                },
                callback: this.enableAutoJoin
            });

            APIBuffer.addListening('skip-video:' + cid, this, [
                API.DJ_ADVANCE
            ], {
                fnCheck: function () {
                    that.watcher.remove('skip-video');

                    return that.model.get('skipVideo');
                },
                callback: function () {
                    var lastVolume = that.lastVolume,
                        nearbyVolume;

                    if (100 === nearbyVolume) {
                        nearbyVolume = 99;
                    } else {
                        nearbyVolume = lastVolume + 1;
                    }

                    that.disableSkipVideo();

                    that.watcher.add('skip-video', function () {
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
            });
        },
        listenToWindow: function () {
            var that = this,
                moduleWindow = this.options.moduleWindow,
                disprWindow = this.options.dispatcherWindow;

            this.listenTo(moduleWindow, 'change:visible', function (mod) {
                if (mod.get('visible')) {
                    if (that.pendingUpdate) {
                        that.update();
                        that.pendindUpdate = false;
                    }
                }
            });

            this.listenTo(disprWindow, disprWindow.CONTROLBOX_CLOSE,
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
            var key, value, changed = e.changedAttributes();

            // view
            if (this.options.moduleWindow.get('visible')) {
                this.update();
            } else {
                this.pendingUpdate = true;
            }

            // model
            for (key in changed) {
                if (changed.hasOwnProperty(key)) {
                    value = changed[key];

                    switch (key) {
                    case 'autoWoot':
                        Plugbot.settings.mainUi.autoWoot = value;
                        break;
                    case 'autoJoin':
                        Plugbot.settings.mainUi.autoJoin = value;
                        break;
                    }
                }
            }

            Settings.saveSettings();
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
                elemWoot =  Ui.plugdj.$woot;

            if (undecided === vote) {
                elemWoot.click();
                vote = API.getUser().vote;

                if (undecided === vote) {
                    this.watcher.add('auto-woot', function () {
                        var ret;

                        elemWoot.click();
                        vote = API.getUser().vote;

                        if (undecided !== vote) {
                            ret = 0;
                        }

                        return ret;
                    });
                }
            }
        },
        disableAutoWoot: function () {
            this.watcher.remove('auto-woot');
        },
        enableAutoJoin: function () {
            var ret = API.djJoin();

            if (0 !== ret) {
                this.watcher.add('auto-join', function () {
                    return API.djJoin();
                });
            }
        },
        disableAutoJoin: function () {
            this.watcher.remove('auto-join');
        },
        enableSkipVideo: function () {
            this.watcher.remove('skip-video');
            this.lastVolume = API.getVolume();
            API.setVolume(0);
        },
        disableSkipVideo: function () {
            var lastVolume = this.lastVolume;

            if (undefined !== lastVolume) {
                this.model.set('skipVideo', false);

                if (0 === API.getVolume()) {
                    API.setVolume(lastVolume);
                    this.lastVolume = undefined;
                }
            }
        },
        close: function () {
            // close the watcher
            this.watcher.close();

            this.remove();
        }
    });

    return View;
});
