/**
 * Site bootstrap
 * Load order: bootstrap.js -> main.js -> app.js
 */

/**
 * @license
 * Copyright (C) 2013 Shawn
 * This program is licensed under the MIT license.
 */

var VAR_AUTO_DEBUG = true,
    RELEASE_LOCAL_REPO = false;

(function () {
    'use strict';

    var module = (function () {
        return {
            DOMAIN: 'plug.dj',
            DEBUG: VAR_AUTO_DEBUG,
            TIMEOUT_LOADING: 5000,
            INTERVAL_RETRY: 1000,
            MAX_NUM_RETRIES: 2,
            PROTOCOL: '//',
            intervalWaitDeps: {
                core: 100,
                module: 200,
                dom: 500
            },
            isAborted: false,
            numFiles: undefined,
            numLoadedFiles: 0,
            loadedFiles: {},
            excludedPaths: ['/', '/dashboard'],
            requiredVariables: ['require', 'define', 'jQuery', '_', 'API'],
            requiredModule: 'core',
            requiredDoms: ['#app', '#playback'],
            dirs: {
                script: 'js/',
                stylesheet: 'css/',
                vendor: 'vendor/'
            },
            baseDirs: {
                debug: 'localhost/Plugbot-Enhanced/assets/',
                release: (RELEASE_LOCAL_REPO ?
                    'localhost/Plugbot-Enhanced/public/' :
                    'ebola777.github.io/files/Plugbot-Enhanced/public/')
            },
            files: {
                debug: 'main.js',
                release: 'main.min.js'
            },
            scripts: [ ],
            stylesheets: [
                'project!style.css'
            ],
            init: function () {
                // verify site -> wait dependencies -> load files -> load app
                var that = this;

                if (this.verifySite()) {
                    if (this.DEBUG) {
                        console.info('Plugbot Initializing...');
                    }

                    this.removeBookmarkScript();
                    this.waitCore(function () {
                        that.waitModule(function () {
                            that.waitDoms(function () {
                                that.loadFiles();
                            });
                        });
                    });
                } else {
                    console.warn('Plugbot Not Bootstrapped Because of Wrong Url.');
                }
            },
            config: function () {
                var baseDir = this.PROTOCOL + (this.DEBUG ? this.baseDirs.debug : this.baseDirs.release),
                    vendorDir = this.PROTOCOL + this.baseDirs.release + this.dirs.vendor;

                requirejs.config({
                    paths: {
                        angular: '//ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular.min',
                        domReady: vendorDir + 'requirejs-domready/js/domReady.min',
                        plugbot: baseDir + this.dirs.script
                    },
                    shim: {
                        angular: {
                            exports: 'angular'
                        }
                    }
                });
            },
            loadApp: function () {
                var that = this,
                    baseDir = this.PROTOCOL + (this.DEBUG ? this.baseDirs.debug : this.baseDirs.release),
                    file = (this.DEBUG ? this.files.debug : this.files.release),
                    main = baseDir + this.dirs.script + file;

                this.config();

                // requires core libraries here
                require(['angular'], function () {
                    // require main file
                    require([main], function () {
                        if (that.DEBUG) {
                            console.info('Plugbot Bootstrapped.');
                        }
                    });
                });
            },
            loadFiles: function () {
                var that = this,
                    i,
                    baseDir = this.PROTOCOL + (this.DEBUG ? this.baseDirs.debug : this.baseDirs.release),
                    prefixProject = 'project!',
                    listScripts = [],
                    listStylesheets = [];

                function addToList(listIn, listOut, projectDir) {
                    var url,
                        urlSub;

                    for (i = 0; i < listIn.length; i += 1) {
                        url = listIn[i];
                        urlSub = url.substr(0, prefixProject.length);

                        if (prefixProject === urlSub) {
                            listOut.push(baseDir + projectDir +
                                url.substr(url.length - prefixProject.length - 1)
                            );
                        } else {
                            listOut.push(that.PROTOCOL + url);
                        }
                    }
                }

                addToList(this.scripts, listScripts, this.dirs.script);
                addToList(this.stylesheets, listStylesheets, this.dirs.stylesheet);

                this.numFiles = listScripts.length + listStylesheets.length;

                for (i = 0; i !== listScripts.length; i += 1) {
                    this.loadScript(listScripts[i]);
                }

                for (i = 0; i !== listStylesheets.length; i += 1) {
                    this.loadStylesheet(listStylesheets[i]);
                }

                if (0 === this.numFiles) {
                    this.loadApp();
                }
            },
            loadScript: function (url, numRetry) {
                var that = this;

                this.getScript(url, {
                    timeout: this.TIMEOUT_LOADING
                }, function () {
                    if (!that.isAborted) { that.fileDone(url); }
                }, function (jqXHR) {
                    if (!that.isAborted) {
                        numRetry  = numRetry || 0;

                        // check retry times
                        if (numRetry === that.MAX_NUM_RETRIES) {
                            that.fileFail(url, {
                                error: jqXHR.status
                            });
                        } else {
                            setTimeout(function () {
                                if (!that.isAborted) {
                                    if (!that.isFileLoaded(url)) {
                                        that.loadScript(url, numRetry + 1);
                                    }
                                }
                            }, that.INTERVAL_RETRY);
                        }
                    }
                });
            },
            loadStylesheet: function (url, numRetry) {
                var that = this;

                this.getCss(url, {
                    timeout: this.TIMEOUT_LOADING,
                    class: 'plugbot-css'
                }, function () {
                    if (!that.isAborted) { that.fileDone(url); }
                }, function () {
                    if (!that.isAborted) {
                        numRetry  = numRetry || 0;

                        // check retry times
                        if (numRetry === that.MAX_NUM_RETRIES) {
                            that.fileFail(url, {
                                error: 'Timeout'
                            });
                        } else {
                            setTimeout(function () {
                                if (!that.isAborted) {
                                    if (!that.isFileLoaded(url)) {
                                        that.loadStylesheet(url, numRetry + 1);
                                    }
                                }
                            }, that.INTERVAL_RETRY);
                        }
                    }
                });
            },
            getScript: function (url, options, fnDone, fnFail) {
                $.ajax({
                    url: url,
                    dataType: 'script',
                    crossDomain: true,
                    timeout: options.timeout,
                    cache: this.DEBUG
                })
                    .done(fnDone)
                    .fail(fnFail);
            },
            getCss: function (url, options, fnDone, fnFail) {
                var link, idTimeout;

                link = $('<link>', {
                    class: options.class,
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: url
                });

                idTimeout = setTimeout(fnFail, options.timeout);
                link[0].onload = function () {
                    clearTimeout(idTimeout);
                    fnDone();
                };

                $(document.head).append(link);
            },
            fileDone: function (url) {
                if (!this.isFileLoaded(url)) {
                    this.numLoadedFiles += 1;
                    this.loadedFiles[url] = true;

                    if (this.numLoadedFiles === this.numFiles) {
                        this.loadApp();
                    }
                }
            },
            fileFail: function (url, options) {
                if (!this.isAborted) {
                    this.isAborted = true;

                    _.defaults(options, {
                        error: 'Unknown'
                    });

                    alert(
                        '[Plugbot] Failed to Load the File, Stopping Now.\n' +
                        '\n' +
                        'File: ' + url + '\n' +
                        'Error: ' + options.error
                    );
                }
            },
            isFileLoaded: function (url) {
                return undefined !== this.loadedFiles[url];
            },
            removeBookmarkScript: function () {
                var src = document.getElementById('plugbot-js');

                if (src) { src.parentElement.removeChild(src); }
            },
            verifySite: function () {
                var domain = document.domain.toUpperCase(),
                    path = window.location.pathname.toUpperCase(),
                    excludedPaths = this.excludedPaths,
                    key,
                    ret = true;

                if (this.DOMAIN.toUpperCase() === domain) {
                    for (key in excludedPaths) {
                        if (excludedPaths.hasOwnProperty(key)) {
                            if (excludedPaths[key].toUpperCase() === path) {
                                ret = false;
                                break;
                            }
                        }
                    }
                } else {
                    ret = false;
                }

                return ret;
            },
            waitCore: function (next) {
                var i = 0,
                    id,
                    deps = this.requiredVariables,
                    dep;

                dep = this.requiredVariables[0];

                id = setInterval(function () {
                    if (window[dep]) {
                        // move to next dep
                        i += 1;
                        if (i >= deps.length) {
                            clearInterval(id);
                            next();
                        } else {
                            dep = deps[i];
                        }
                    }
                }, this.intervalWaitDeps.core);
            },
            waitModule: function (next) {
                var that = this,
                    id = setInterval(function () {
                        if (requirejs.specified(that.requiredModule)) {
                            clearInterval(id);
                            next();
                        }
                    }, this.intervalWaitDeps.module);
            },
            waitDoms: function (next) {
                var i = 0,
                    id,
                    requiredDoms = this.requiredDoms,
                    requiredDom;

                requiredDom = requiredDoms[0];

                id = setInterval(function () {
                    if ($(requiredDom).length) {
                        i += 1;
                        if (i >= requiredDoms.length) {
                            clearInterval(id);
                            next();
                        } else {
                            requiredDom = requiredDoms[i];
                        }
                    }
                }, this.intervalWaitDeps.dom);
            }
        };
    }());

    module.init();
}());
