// TODO ESC keeps @mention
// TODO open video link
// TODO emoticons
// TODO selectable sort method
// TODO group users by accordion
// TODO detect css loading failure
// TODO refactor dialog paths
// TODO make userlist render like taskbar
// TODO comparatpr sort by mutiple fields -> more convenient way
// TODO raf option
// TODO refactor Watcher & Countdown -> use id
// TODO menu in taskbar
// TODO try to resume volume at the beginning of the vid

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
 * Constructor
 */
(function () {
    'use strict';

    var src;

    // remove script created by the bookmark
    src = document.getElementById('plugbot-js');
    if (null !== src) {
        src.parentElement.removeChild(src);
    }

    // Namespace declaration
    if (!window.hasOwnProperty('Plugbot')) {
        window.Plugbot = {};
    } else {
        if (Plugbot.hasOwnProperty('reload')) {
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

    // called when PlugBot has been initialized
    Plugbot.initDone = function () {
        // custom debug code
        // (DEBUG)
        console.timeEnd('Load Plugbot');

        delete Plugbot.simpleRemove;
    };

    // Check dependencies
    if (undefined === window.require ||
            undefined === window.API) {
        Plugbot.simpleRemove();
        return;
    }

    if (!requirejs.specified('room')) {
        Plugbot.simpleRemove();
        return;
    }

    // Initialization
    require(['Plugbot/Loader'], function (Loader) {
        // initialize
        Loader.initialize();

        // custom debug code
        // (DEBUG)
        // add global variables for debugging
        req('Plugbot/Entry', 'PBE');
    });
}());

/**
 * PlugBot entry
 */
define('Plugbot/Entry', [], function () {
    'use strict';

    var Entry = (function () {
        var that = {
            // build environment
            // (RELEASE)
            environment: 'DEBUG',
            // base URL
            // (RELEASE)
            baseUrl: 'localhost/Plugbot-Enhanced-by-Ebola/',
            // script directory
            scriptDir: 'js/',
            // css directory
            cssDir: 'css/',
            // all scripts
            scripts: [
                // main
                'Plugbot/main/Init',
                'Plugbot/main/Dispose',
                'Plugbot/main/Settings',
                'Plugbot/main/WindowManager',

                // models
                'Plugbot/models/dialog/Taskbar',
                'Plugbot/models/dialog/TaskbarItemModel',
                'Plugbot/models/dialog/TaskbarCollection',
                'Plugbot/models/dialog/FloatedWindow',
                'Plugbot/models/MainUi/Model',
                'Plugbot/models/MainUi/ItemModel',
                'Plugbot/models/MainUi/ItemCollection',
                'Plugbot/models/Userlist/Model',
                'Plugbot/models/Userlist/ItemModel',
                'Plugbot/models/Userlist/ItemCollection',

                // views
                'Plugbot/views/utils/UiHelpers',
                'Plugbot/views/Ui',
                'Plugbot/views/dialog/Taskbar',
                'Plugbot/views/dialog/TaskbarItemView',
                'Plugbot/views/dialog/FloatedWindow',
                'Plugbot/views/layout/TableLayout',
                'Plugbot/views/MainUi/ItemView',
                'Plugbot/views/MainUi/View',
                'Plugbot/views/Userlist/HeadView',
                'Plugbot/views/Userlist/UsersItemView',
                'Plugbot/views/Userlist/UsersView',
                'Plugbot/views/Userlist/View',

                // events
                'Plugbot/events/BaseEvents',
                'Plugbot/events/SiteEvents',
                'Plugbot/events/dialog/FloatedWindowEvents',
                'Plugbot/events/dialog/TaskbarItemEvents',

                // utilities
                'Plugbot/utils/APIBuffer',
                'Plugbot/utils/Helpers',
                'Plugbot/utils/Ticker',
                'Plugbot/utils/Watcher',
                'Plugbot/utils/Countdown',

                // storage
                'Plugbot/store/LocalStorage'
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
                return 'http://' + that.baseUrl + that.scriptDir +
                    item.split('/').slice(1).join('/') + '.js';
            },
            getRefScriptUrl: function (item) {
                return 'http://' + item;
            },
            getCssUrl: function (item) {
                return 'http://' + that.baseUrl + that.cssDir + item;
            },
            getRefCssUrl: function (item) {
                return 'http://' + item;
            }
        };

        return that;
    }());

    return Entry;
});

/**
 * PlugBot loader
 * initialize => loadScript, loadCss => fileDone => loadDep
 */
define('Plugbot/Loader', ['Plugbot/Entry'], function (Entry) {
    'use strict';

    var Loader = (function () {
        var that = {
            /**
             * Constants
             */
            // timeout
            timeoutLoading: 5000,
            // retry interval
            intervalRetry: 1000,
            // max retry number
            maxNumRetry: 2,

            /**
             * Defined at runtime
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
                that = this;

                var i,
                    numFiles = 0,
                    listScripts = [],
                    listCss = [];

                // init attributes
                this.numFiles = 0;
                this.numLoadedFiles = 0;
                this.loadedFiles = {};
                this.aborted = false;

                // load core scripts
                // (DEBUG)
                for (i = 0; i !== Entry.scripts.length; i += 1) {
                    listScripts.push(Entry.getScriptUrl(Entry.scripts[i]));
                    numFiles += 1;
                }

                // load reference scripts
                for (i = 0; i !== Entry.refScriptsUrl.length; i += 1) {
                    listScripts.push(
                        Entry.getRefScriptUrl(Entry.refScriptsUrl[i])
                    );
                    numFiles += 1;
                }

                // load css files
                for (i = 0; i !== Entry.cssUrl.length; i += 1) {
                    listCss.push(Entry.getCssUrl(Entry.cssUrl[i]));
                    numFiles += 1;
                }

                // load reference css files
                for (i = 0; i !== Entry.refCssUrl.length; i += 1) {
                    listCss.push(Entry.getRefCssUrl(Entry.refCssUrl[i]));
                    numFiles += 1;
                }

                // load dependencies directly if there is nothing to load
                if (0 === numFiles) {
                    that.loadDep();
                    return;
                }

                // record number of files
                that.numFiles = numFiles;

                // load all scripts & css files
                for (i = 0; i !== listCss.length; i += 1) {
                    that.loadCss(listCss[i]);
                }

                for (i = 0; i !== listScripts.length; i += 1) {
                    that.loadScript(listScripts[i], 0);
                }
            },
            /**
             * Load dependencies, last step
             */
            loadDep: function () {
                var i, scriptDep = Entry.scriptDep, ret;

                // custom debug code
                // (DEBUG)
                // record loading time
                console.time('Load Plugbot');

                // require modules
                require(scriptDep, function () {
                    for (i = 0; i !== scriptDep.length; i += 1) {
                        ret = require(scriptDep[i]);
                        if (undefined !== ret) {
                            if (undefined !== ret.initialize) {
                                ret.initialize();
                            }
                        }
                    }
                });
            },
            /**
             * Called when one file is loaded
             * @param {String} url      File URL
             */
            fileDone: function (url) {
                // check if the file has been loaded
                if (that.isFileLoaded(url)) { return; }

                // record loaded file
                that.loadedFiles[url] = true;

                // increase the counter
                that.numLoadedFiles += 1;

                // check if all files have been loaded
                if (that.numLoadedFiles === that.numFiles) {
                    that.loadDep();
                }
            },
            /**
             * When a script failed to load after many retries
             * @param {String} url          Script URL
             */
            scriptFail: function (url) {
                if (that.aborted) { return; }
                that.aborted = true;
                alert('Failed to load PlugBot file, stopping now.\n' +
                    '\n' +
                    'File: ' + url + '\n' +
                    'Error: Timeout'
                     );
                Plugbot.simpleRemove();
            },
            /**
             * Load a script
             * @param {String} url                      Script URL
             * @param {Number|undefined} numRetry     Number of retries
             */
            loadScript: function (url, numRetry) {
                var idTimeout;

                // check if current action has been aborted
                if (that.aborted) { return; }

                // check retry argument
                numRetry  = numRetry || 0;

                idTimeout = setTimeout(function () {
                    numRetry += 1;

                    // check retry times
                    if (numRetry === that.maxNumRetry) {
                        that.scriptFail(url);
                        return;
                    }

                    // retry
                    setTimeout(function () {
                        if (that.aborted) { return; }
                        if (!that.isFileLoaded(url)) {
                            that.loadScript(url, numRetry);
                        }
                    }, that.intervalRetry);
                }, that.timeoutLoading);

                // get script
                that.getScript(url, function () {
                    if (that.aborted) { return; }
                    clearTimeout(idTimeout);
                    that.fileDone(url);
                });
            },
            /**
             * Load css file
             * @param {String} url       CSS file
             */
            loadCss: function (url) {
                that.getCss(Entry.cssClassname, url);
                that.fileDone(url);
            },
            /**
             * Get a script core function
             * @param {String} url          Script URL
             * @param {Function} callback   Callback function
             */
            getScript: function (url, callback) {
                $.ajax({
                    type: 'GET',
                    url: url,
                    dataType: 'script',
                    crossDomain: true,
                    // (RELEASE)
                    cache: true
                }).done(callback);
            },
            getCss: function (classname, url) {
                var link;

                link = $(document.createElement('link')).prop({
                    'class': classname,
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: url
                });

                $(document.head).prepend(link);
            },
            /**
             * Check if a file has been loaded
             * @param {String} url      File URL
             * @return {Boolean}        True if loaded
             */
            isFileLoaded: function (url) {
                return undefined !== that.loadedFiles[url];
            }
        };

        return that;
    }());

    return Loader;
});

/**
 * (DEBUG)
 * ex. req('app/base/Class', 'BaseClass');
 * @param {String} module   Module name
 * @param {String} name     Debug symbol
 */
window.req = function (module, name) {
    'use strict';

    require([module], function (mod) {
        window[name] = mod;
    });
};
