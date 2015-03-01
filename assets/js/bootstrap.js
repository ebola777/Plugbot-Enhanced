/**
 * <p>Site bootstrap file, entry file, prepare dependencies.</p>
 * <p>Module loading order: bootstrap.js -> main.js -> app.js.</p>
 * <p>In this module, bootstrapping steps are as follows:
 * <ol>
 *     <li>Check whether the current site is a plug.dj room</li>
 *     <li>Wait for dependencies</li>
 *     <li>Load external files</li>
 *     <li>Run app bootstrap (plugbot/main)</li>
 * </ol>
 * </p>
 *
 * @module plugbot/bootstrap
 * @author ebola777@yahoo.com.tw (Shawn Chang)
 * @copyright Shawn Chang 2013
 * @license MIT
 */

/* eslint-disable no-console */

(function () {
    "use strict";

    /*
     * Development
     */
    var DEBUG;
    var BASE_DIR_TYPE;

    /*
     * Preferences of site
     */
    var DOMAIN = "plug.dj";
    var PROTOCOL = "//";

    /*
     * Preferences of loading
     */
    var TIMEOUT_LOADING = 5000;
    var INTERVAL_RETRY = 1000;
    var MAX_RETRY_TIMES = 2;
    var INTERVAL_WAIT_CORE = 100;
    var INTERVAL_WAIT_MODULE = 200;
    var INTERVAL_WAIT_DOM = 500;
    var PROJECT_FILE_PREFIX = "project!";

    /*
     * Preferences of location
     */
    var BASE_DIR_ASSETS_DEBUG = "localhost/Plugbot-Enhanced/assets/";
    var BASE_DIR_PUBLIC_DEBUG = "localhost/Plugbot-Enhanced/public/";
    var BASE_DIR_PUBLIC_RELEASE = "ebola777.github.io/files/Plugbot-Enhanced/public/";
    var DIR_SCRIPT = "js/";
    var DIR_STYLESHEET = "css/";
    var DIR_VENDOR = "bower_components/";
    var FILE_APP_ASSETS = "main.js";
    var FILE_APP_PUBLIC = "main.min.js";

    /*
     * Loading
     */
    var baseDirUrl;
    var mainFileUrl;
    var isAborted = false;
    var totalFileCount = 0;
    var loadedFileCount = 0;
    var loadedFiles = {};
    var excludedSitePaths = ["/", "/dashboard"];
    var requiredVariables = ["requirejs", "jQuery", "_", "API"];
    var requiredModule = "core";
    var requiredDoms = ["#playback"];
    var scripts = [];
    var stylesheets = ["project!style.css"];

    /*
     * Utilities
     */

    function removeBookmarkScript() {
        var src = document.getElementById("plugbot-js");

        if (src) {
            src.parentElement.removeChild(src);
        }
    }

    function isSiteValid() {
        var currentDomain = document.domain;
        var currentPath = window.location.pathname;
        var excludedSitePath;
        var isValid = true;

        if (currentDomain.toLowerCase() === DOMAIN.toLowerCase()) {
            for (excludedSitePath in excludedSitePaths) {
                if (excludedSitePaths.hasOwnProperty(excludedSitePath)) {
                    if (currentPath.toLowerCase() === excludedSitePaths[excludedSitePath].toLowerCase()) {
                        isValid = false;
                        break;
                    }
                }
            }
        } else {
            isValid = false;
        }

        return isValid;
    }

    function getUrlWithoutTrailingSlash(url) {
        if (url.substr(-1) === "/") {
            url = url.substr(0, url.length - 1);
        }

        return url;
    }

    function getBaseDir() {
        if (!baseDirUrl) {
            baseDirUrl = PROTOCOL;

            if (BASE_DIR_TYPE === "public release") {
                baseDirUrl += BASE_DIR_PUBLIC_RELEASE;
            } else if (BASE_DIR_TYPE === "public debug") {
                baseDirUrl += BASE_DIR_PUBLIC_DEBUG;
            } else if (BASE_DIR_TYPE === "assets debug") {
                baseDirUrl += BASE_DIR_ASSETS_DEBUG;
            }

            return baseDirUrl;
        }

        return baseDirUrl;
    }

    function getMainFile() {
        if (!mainFileUrl) {
            mainFileUrl = getBaseDir() + DIR_SCRIPT;

            if (BASE_DIR_TYPE === "public release") {
                mainFileUrl += FILE_APP_PUBLIC;
            } else if (BASE_DIR_TYPE === "public debug") {
                mainFileUrl += FILE_APP_PUBLIC;
            } else if (BASE_DIR_TYPE === "assets debug") {
                mainFileUrl += FILE_APP_ASSETS;
            }
        }

        return mainFileUrl;
    }

    function getScript(url, options) {
        $.ajax({
            url: url,
            dataType: "script",
            crossDomain: true,
            timeout: options.timeout,
            cache: DEBUG
        })
            .done(options.doneCallback)
            .fail(options.failCallback);
    }

    function getCss(url, options) {
        var link;
        var idTimeout;

        link = $("<link>", {
            class: options.class,
            rel: "stylesheet",
            type: "text/css",
            href: url
        });

        idTimeout = setTimeout(options.failCallback, options.timeout);
        link[0].onload = function () {
            clearTimeout(idTimeout);
            options.doneCallback();
        };

        $(document.head).append(link);
    }

    function convertFilesUrl(listIn, projectDir) {
        var i;
        var listOut = [];
        var baseDir = getBaseDir();
        var url;
        var urlProjectPrefixHead;
        var urlProjectPrefixTail;

        for (i = 0; i < listIn.length; ++i) {
            url = listIn[i];
            urlProjectPrefixHead = url.substr(0, PROJECT_FILE_PREFIX.length);

            if (urlProjectPrefixHead === PROJECT_FILE_PREFIX) {
                urlProjectPrefixTail = url.substr(url.length - PROJECT_FILE_PREFIX.length - 1);

                listOut.push(baseDir + projectDir + urlProjectPrefixTail);
            } else {
                listOut.push(PROTOCOL + url);
            }
        }

        return listOut;
    }

    /*
     * Configuration
     */

    function configureRequireJs() {
        var baseDir = getBaseDir();
        var vendorDir = baseDir + DIR_VENDOR;

        requirejs.config({
            paths: {
                plugbot: getUrlWithoutTrailingSlash(baseDir + DIR_SCRIPT),
                angular: "//ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular.min",
                domReady: vendorDir + "requirejs-domready/domReady"
            },
            shim: {
                angular: {
                    exports: "angular"
                }
            }
        });
    }

    /*
     * Loading app
     */

    function loadApp() {
        var mainFile = getMainFile();

        configureRequireJs();

        // Make sure angular is exported first, because main.js and views/index.js are combined but views/index.js
        // doesn't support AMD and use angular as globals, if didn't wrap with it, there would be "angular is not
        // defined" error.
        require(["angular"], function () {
            // Require app bootstrap
            require([mainFile], function () {
                console.info("Plug.bot Bootstrapped.");
            });
        });
    }

    /*
     * Loading files
     */

    function isFileLoaded(url) {
        return !_.isUndefined(loadedFiles[url]);
    }

    function fileDone(url) {
        if (!isFileLoaded(url)) {
            loadedFileCount += 1;
            loadedFiles[url] = true;

            if (loadedFileCount === totalFileCount) {
                loadApp();
            }
        }
    }

    function fileFail(url, options) {
        if (!isAborted) {
            isAborted = true;

            options.error = options.error || "Unknown";

            console.error("Plug.bot Failed to Load the File, Stopping Now.\n" +
                "\n" +
                "File: " + url + "\n" +
                "Error: " + options.error
            );
        }
    }

    function waitToRetryLoadingFile(url, done) {
        setTimeout(function () {
            if (!isAborted) {
                if (!isFileLoaded(url)) {
                    done();
                }
            }
        }, INTERVAL_RETRY);
    }

    function loadScript(url, numRetry) {
        getScript(url, {
            timeout: TIMEOUT_LOADING,
            doneCallback: function () {
                if (!isAborted) {
                    fileDone(url);
                }
            },
            failCallback: function (jqXHR) {
                if (!isAborted) {
                    numRetry = numRetry || 0;

                    // Check retry times
                    if (numRetry === MAX_RETRY_TIMES) {
                        fileFail(url, {
                            error: jqXHR.status
                        });
                    } else {
                        waitToRetryLoadingFile(url, function () {
                            loadScript(url, numRetry + 1);
                        });
                    }
                }
            }
        });
    }

    function loadStylesheet(url, numRetry) {
        getCss(url, {
            timeout: TIMEOUT_LOADING,
            class: "plugbot-css",
            doneCallback: function () {
                if (!isAborted) {
                    fileDone(url);
                }
            },
            failCallback: function () {
                if (!isAborted) {
                    numRetry = numRetry || 0;

                    // Check retry times
                    if (numRetry === MAX_RETRY_TIMES) {
                        fileFail(url, {
                            error: "Timeout"
                        });
                    } else {
                        waitToRetryLoadingFile(url, function () {
                            loadStylesheet(url, numRetry + 1);
                        });
                    }
                }
            }
        });
    }

    function loadFiles() {
        var i;
        var listScripts;
        var listStylesheets;

        listScripts = convertFilesUrl(scripts, DIR_SCRIPT);
        listStylesheets = convertFilesUrl(stylesheets, DIR_STYLESHEET);

        totalFileCount = listScripts.length + listStylesheets.length;

        for (i = 0; i !== listScripts.length; ++i) {
            loadScript(listScripts[i]);
        }

        for (i = 0; i !== listStylesheets.length; ++i) {
            loadStylesheet(listStylesheets[i]);
        }

        if (totalFileCount === 0) {
            loadApp();
        }
    }

    /*
     * Waiting dependencies
     */

    function waitCore(next) {
        var id;
        var requiredVariableIndex = 0;
        var requiredVariable;

        requiredVariable = requiredVariables[0];

        id = setInterval(function () {
            if (window[requiredVariable]) {
                // Move to next dependency
                requiredVariableIndex += 1;
                if (requiredVariableIndex >= requiredVariables.length) {
                    clearInterval(id);
                    next();
                } else {
                    requiredVariable = requiredVariables[requiredVariableIndex];
                }
            }
        }, INTERVAL_WAIT_CORE);
    }

    function waitModule(next) {
        var id = setInterval(function () {
            if (requirejs.specified(requiredModule)) {
                clearInterval(id);
                next();
            }
        }, INTERVAL_WAIT_MODULE);
    }

    function waitDoms(next) {
        var id;
        var requiredDomIndex = 0;
        var requiredDom;

        requiredDom = requiredDoms[0];

        id = setInterval(function () {
            if ($(requiredDom).length) {
                requiredDomIndex += 1;
                if (requiredDomIndex >= requiredDoms.length) {
                    clearInterval(id);
                    next();
                } else {
                    requiredDom = requiredDoms[requiredDomIndex];
                }
            }
        }, INTERVAL_WAIT_DOM);
    }

    /*
     * Initialization
     */

    function loadDevelopmentVariables() {
        // Default values
        DEBUG = false;
        BASE_DIR_TYPE = "public release";

        // Use specified values
        if (window.plugbot && window.plugbot.dev) {
            DEBUG = window.plugbot.dev.DEBUG || DEBUG;
            BASE_DIR_TYPE = window.plugbot.dev.BASE_DIR_TYPE || BASE_DIR_TYPE;
        }
    }

    function initialize() {
        if (isSiteValid()) {
            console.info("Initialize Plug.bot.");

            if (DEBUG) {
                console.warn("Plug.bot DEBUG on.");
            }

            removeBookmarkScript();

            waitCore(function () {
                waitModule(function () {
                    waitDoms(function () {
                        loadFiles();
                    });
                });
            });
        } else {
            console.error("Plug.bot Not Bootstrapped Because of Wrong Url.");
        }
    }

    loadDevelopmentVariables();
    initialize();
}());
