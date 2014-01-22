// TODO ESC keeps @mention
// TODO open video link
// TODO emoticons
// TODO selectable sort method
// TODO group users by accordion
// TODO menu in taskbar

/**
 * (DEBUG)
 * Development NOTICE:
 * Remove all sections after copying code to release.js.
 * (find them by searching the word '(DEBUG)')
 *
 * Change following code after copying code to release.js:
 * (find them by searching the word '(RELEASE)')
 * - environment to 'RELEASE'
 * - baseUrl to GitHub page URL
 * - cssUrl to 'style.min.css'
 * - cache to false
 */

/**
 * Init
 */
(function () {
    'use strict';

    var src;

    // remove script created by the bookmark
    src = document.getElementById('plugbot-js');
    if (null !== src) {
        src.parentElement.removeChild(src);
    }

    // namespace declaration
    if (undefined === window.Plugbot) {
        window.Plugbot = {};
    } else {
        if (undefined !== Plugbot.reload) {
            Plugbot.reload();
        }

        return;
    }

    // simple remove function
    Plugbot.simpleRemove = function () {
        // remove IDs from RequireJS
        if (undefined !== window.requirejs) {
            requirejs.undef('Plugbot/Entry');
            requirejs.undef('Plugbot/Loader');
        }

        // remove namespaces
        delete window.Plugbot;
    };

    // called when Plugbot has been initialized
    Plugbot.initDone = function () {
        // custom debug code
        // (DEBUG)
        console.timeEnd('Load Plugbot');

        delete Plugbot.simpleRemove;
    };

    // check site dependencies
    if (undefined === window.API || !requirejs.specified('room')) {
        Plugbot.simpleRemove();
        return;
    }

    // initialization
    require(['Plugbot/Loader'], function (Loader) {
        // initialize
        Loader.initialize();

        // custom debug code
        // (DEBUG)
        //window.req('Plugbot/Entry', 'PBE');
    });
}());

/**
 * Plugbot entry
 */
define('Plugbot/Entry', [], function () {
    'use strict';

    var entry = (function () {
        return {
            // build environment
            // (RELEASE)
            environment: 'DEBUG',
            // base URL
            // (RELEASE)
            baseUrl: 'localhost/Plugbot-Enhanced/',
            // script directory
            scriptDir: 'js/',
            // css directory
            cssDir: 'css/',
            // all scripts
            scripts: [
            /**
             * Base
             */
                'Plugbot/base/Events',
                'Plugbot/base/SubView',
                'Plugbot/base/Template',
                'Plugbot/base/Timer',
            /**
             * Collections
             */
                // taskbar
                'Plugbot/colls/Taskbar/ItemCollection',
                // userlist
                'Plugbot/colls/Userlist/ItemCollection',
            /**
             * Events
             */
                // floated window
                'Plugbot/events/FloatedWindow/Events',
                // main UI
                'Plugbot/events/MainUi/Events',
                // managers
                'Plugbot/events/mgrs/WindowManager',
                // site
                'Plugbot/events/site/Events',
                'Plugbot/events/site/RoomSize',
                // taskbar
                'Plugbot/events/Taskbar/ItemEvents',
            /**
             * Main
             */
                'Plugbot/main/mgrs/ResourceManager',
                'Plugbot/main/mgrs/SiteManager',
                'Plugbot/main/mgrs/TaskbarManager',
                'Plugbot/main/mgrs/WindowManager',
                'Plugbot/main/Dispose',
                'Plugbot/main/Init',
                'Plugbot/main/Settings',
            /**
             * Models
             */
                // floated window
                'Plugbot/models/FloatedWindow/Model',
                // main UI
                'Plugbot/models/MainUi/Model',
                // taskbar
                'Plugbot/models/Taskbar/ItemModel',
                'Plugbot/models/Taskbar/Model',
                // userlist
                'Plugbot/models/Userlist/HeadModel',
                'Plugbot/models/Userlist/Model',
                'Plugbot/models/Userlist/UsersModel',
            /**
             * Storage
             */
                'Plugbot/store/LocalStorage',
                'Plugbot/store/LZString',
            /**
             * Templates
             */
                // floated window
                'Plugbot/tmpls/FloatedWindow/View',
                // main UI
                'Plugbot/tmpls/MainUi/View',
                // taskbar
                'Plugbot/tmpls/Taskbar/ItemView',
                'Plugbot/tmpls/Taskbar/View',
                // userlist
                'Plugbot/tmpls/Userlist/HeadView',
                'Plugbot/tmpls/Userlist/UsersItemView',
                'Plugbot/tmpls/Userlist/View',
            /**
             * Utilities
             */
                'Plugbot/utils/API',
                'Plugbot/utils/APIBuffer',
                'Plugbot/utils/Countdown',
                'Plugbot/utils/Helpers',
                'Plugbot/utils/Ticker',
                'Plugbot/utils/Watcher',
            /**
             * Views
             */
                // floated window
                'Plugbot/views/FloatedWindow/View',
                // layout
                'Plugbot/views/layout/TableLayout',
                // main UI
                'Plugbot/views/MainUi/View',
                // taskbar
                'Plugbot/views/Taskbar/View',
                'Plugbot/views/Taskbar/ItemView',
                // userlist
                'Plugbot/views/Userlist/HeadView',
                'Plugbot/views/Userlist/UsersItemView',
                'Plugbot/views/Userlist/UsersView',
                'Plugbot/views/Userlist/View',
                // utilities
                'Plugbot/views/utils/Ui',
                'Plugbot/views/utils/UiHelpers'
            ],
            // script dependencies order
            scriptDep: [
                // #1: Settings
                'Plugbot/main/Settings',

                // #2: Init
                'Plugbot/main/Init',

                // #3: Dispose
                'Plugbot/main/Dispose'
            ],
            // scripts used as reference
            refScriptsUrl: [
                'ajax.googleapis.com/ajax/libs/jqueryui/' +
                    '1.10.3/jquery-ui.min.js'
            ],
            // css URL
            // (RELEASE)
            cssUrl: [
                'style.css'
            ],
            // css files used as reference
            refCssUrl: [
                'ajax.googleapis.com/ajax/libs/jqueryui/' +
                    '1.10.3/themes/smoothness/jquery-ui.min.css'
            ],
            // css classname
            cssClassname: 'css-plugbot-enhanced',
            // (DEBUG)
            getScriptUrl: function (item) {
                return 'http://' + this.baseUrl + this.scriptDir +
                    item.split('/').slice(1).join('/') + '.js';
            },
            getRefScriptUrl: function (item) {
                return 'http://' + item;
            },
            getCssUrl: function (item) {
                return 'http://' + this.baseUrl + this.cssDir + item;
            },
            getRefCssUrl: function (item) {
                return 'http://' + item;
            }
        };
    }());

    return entry;
});

/**
 * Plugbot loader
 * order: initialize -> loadScript, loadCss -> fileDone -> loadDep
 */
define('Plugbot/Loader', ['Plugbot/Entry'], function (Entry) {
    'use strict';

    var loader = (function () {
        return {
            /**
             * Constants
             */
            // timeout
            TIMEOUT_LOADING: 5000,
            // retry interval
            INTERVAL_RETRY: 1000,
            // max retry number
            MAX_NUM_RETRIES: 2,
            // load depedencies function name
            FUNC_NAME_LOAD_DEP: 'initialize',
            /**
             * Runtime
             */
            // number of files
            numFiles: undefined,
            // number of loaded files
            numLoadedFiles: undefined,
            // loaded files list
            loadedFiles: undefined,
            // if loading has been aborted
            aborted: undefined,
            /**
             * Load scripts and css files
             */
            initialize: function () {
                var i,
                    numFiles = 0,
                    listScripts = [],
                    listCss = [];

                // init attributes
                this.numFiles = 0;
                this.numLoadedFiles = 0;
                this.loadedFiles = {};
                this.aborted = false;

                // push core scripts
                // (DEBUG)
                for (i = 0; i !== Entry.scripts.length; i += 1) {
                    listScripts.push(Entry.getScriptUrl(Entry.scripts[i]));
                    numFiles += 1;
                }

                // push reference scripts
                for (i = 0; i !== Entry.refScriptsUrl.length; i += 1) {
                    listScripts.push(
                        Entry.getRefScriptUrl(Entry.refScriptsUrl[i])
                    );
                    numFiles += 1;
                }

                // push css files
                for (i = 0; i !== Entry.cssUrl.length; i += 1) {
                    listCss.push(Entry.getCssUrl(Entry.cssUrl[i]));
                    numFiles += 1;
                }

                // push reference css files
                for (i = 0; i !== Entry.refCssUrl.length; i += 1) {
                    listCss.push(Entry.getRefCssUrl(Entry.refCssUrl[i]));
                    numFiles += 1;
                }

                // load dependencies directly if there is nothing to load
                if (0 === numFiles) {
                    this.loadDep();
                    return;
                }

                // record number of files
                this.numFiles = numFiles;

                // load all css files
                for (i = 0; i !== listCss.length; i += 1) {
                    this.loadCss(listCss[i]);
                }

                // load all scripts
                for (i = 0; i !== listScripts.length; i += 1) {
                    this.loadScript(listScripts[i], 0);
                }
            },
            /**
             * Load dependencies, last step
             */
            loadDep: function () {
                var that = this,
                    i,
                    scriptDep = Entry.scriptDep,
                    ret,
                    fnLoadDep;

                // custom debug code
                // (DEBUG)
                // record loading time
                console.time('Load Plugbot');

                // require modules
                require(scriptDep, function () {
                    for (i = 0; i !== scriptDep.length; i += 1) {
                        ret = require(scriptDep[i]);
                        if (undefined !== ret) {
                            fnLoadDep = ret[that.FUNC_NAME_LOAD_DEP];

                            if (_.isFunction(fnLoadDep)) {
                                ret[that.FUNC_NAME_LOAD_DEP]();
                            }
                        }
                    }
                });
            },
            /**
             * Called when one file is loaded
             * @param {string} url      File URL
             */
            fileDone: function (url) {
                // check if the file has been loaded
                if (this.isFileLoaded(url)) { return; }

                // record loaded file
                this.loadedFiles[url] = true;

                // increase the counter
                this.numLoadedFiles += 1;

                // check if all files have been loaded
                if (this.numLoadedFiles === this.numFiles) {
                    this.loadDep();
                }
            },
            /**
             * When a file failed to load after many retries
             * @param {string} url          URL
             * @param {Object} options      Options
             */
            fileFail: function (url, options) {
                if (this.aborted) { return; }
                this.aborted = true;

                _.defaults(options, {
                    textError: 'Unknown'
                });

                alert('Failed to load Plugbot file, stopping now.\n' +
                    '\n' +
                    'File: ' + url + '\n' +
                    'Error: ' + options.textError);
                Plugbot.simpleRemove();
            },
            /**
             * Load a script
             * @param {string} url          URL
             * @param {number=} numRetry    Number of retries
             */
            loadScript: function (url, numRetry) {
                var that = this;

                // check if current action has been aborted
                if (this.aborted) { return; }

                // get script
                this.getScript(url, {
                    timeout: this.TIMEOUT_LOADING
                }, function fnDone() {
                    if (that.aborted) { return; }

                    that.fileDone(url);
                }, function fnFail(jqXHR) {
                    if (that.aborted) { return; }

                    numRetry  = numRetry || 0;
                    numRetry += 1;

                    // check retry times
                    if (numRetry === that.MAX_NUM_RETRIES) {
                        that.fileFail(url, {
                            textError: jqXHR.status
                        });

                        return;
                    }

                    setTimeout(function () {
                        if (that.aborted) { return; }
                        if (!that.isFileLoaded(url)) {
                            that.loadScript(url, numRetry);
                        }
                    }, that.INTERVAL_RETRY);
                });
            },
            /**
             * Load a css file
             * @param {string} url          URL
             * @param {number=} numRetry    Number of retries
             */
            loadCss: function (url, numRetry) {
                var that = this;

                // check if current action has been aborted
                if (this.aborted) { return; }

                this.getCss(url, {
                    timeout: this.TIMEOUT_LOADING,
                    classname: Entry.cssClassname
                }, function fnDone() {
                    if (that.aborted) { return; }

                    that.fileDone(url);
                }, function fnFail() {
                    if (that.aborted) { return; }

                    numRetry  = numRetry || 0;
                    numRetry += 1;

                    // check retry times
                    if (numRetry === that.MAX_NUM_RETRIES) {
                        that.fileFail(url, {
                            textError: 'Timeout'
                        });

                        return;
                    }

                    setTimeout(function () {
                        if (that.aborted) { return; }
                        if (!that.isFileLoaded(url)) {
                            that.loadCss(url, numRetry);
                        }
                    }, that.INTERVAL_RETRY);
                });
            },
            /**
             * Get a script core function
             * @param {string} url      URL
             * @param {Object} options  Options
             * @param {function} fnDone Function callback when it's done
             * @param {function} fnFail Function callback when failure occurs
             */
            getScript: function (url, options, fnDone, fnFail) {
                $.ajax({
                    url: url,
                    dataType: 'script',
                    crossDomain: true,
                    timeout: options.timeout,
                    // (RELEASE)
                    cache: true
                })
                    .done(fnDone)
                    .fail(fnFail);
            },
            /**
             * Get a css core function
             * @param {string} url      URL
             * @param {Object} options  Options
             * @param {function} fnDone Function callback when it's done
             * @param {function} fnFail Function callback when failure occurs
             */
            getCss: function (url, options, fnDone, fnFail) {
                var link, idTimeout;

                link = $(document.createElement('link')).prop({
                    'class': options.classname,
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
            /**
             * Check if a file has been loaded
             * @param {string} url      File URL
             * @return {boolean}        True if loaded
             */
            isFileLoaded: function (url) {
                return undefined !== this.loadedFiles[url];
            }
        };
    }());

    return loader;
});

/**
 * (DEBUG)
 * Add a module as variable to window for debugging
 * @param {string} module   Module name
 * @param {string} name     Debug symbol
 */
window.req = function (module, name) {
    'use strict';

    require([module], function (mod) {
        window[name] = mod;
    });
};
