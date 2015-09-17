/**
 * <p>Bootstrap file for preparing dependencies.</p>
 * <p>Module loading order: bootstrap.js -> main.js -> app.js.</p>
 * <p>In this module, bootstrapping steps are as follows:
 * <ol>
 *     <li>Check whether the current webpage is a plug.dj room.</li>
 *     <li>Wait for dependencies.</li>
 *     <li>Load external files.</li>
 *     <li>Run app bootstrap file (plugbot/main).</li>
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
     * Development environment variables.
     */
    var DEBUG;
    var BASE_DIR_TYPE;

    /*
     * Website preferences.
     */
    var DOMAIN = "plug.dj";
    var PROTOCOL = "https://";

    /*
     * Loading preferences.
     */
    var TIMEOUT_LOADING = 5000;
    var INTERVAL_RETRY = 1000;
    var MAX_RETRY_TIMES = 2;
    var INTERVAL_WAIT_JAVASCRIPT_VARIABLES = 100;
    var INTERVAL_WAIT_REQUIREJS_MODULES = 200;
    var INTERVAL_WAIT_WEBPAGE_ELEMENTS = 500;
    var PROJECT_FILE_PREFIX = "project!";

    /*
     * Resource preferences.
     */
    var BASE_DIR_ASSETS_DEBUG = "localhost/Plugbot-Enhanced/assets/";
    var BASE_DIR_PUBLIC_DEBUG = "localhost/Plugbot-Enhanced/public/";
    var BASE_DIR_PUBLIC_RELEASE = "ebola777.github.io/Plugbot-Enhanced/downloads/public/";
    var DIR_SCRIPT = "js/";
    var DIR_STYLESHEET = "css/";
    var DIR_VENDOR = "bower_components/";
    var FILE_APP_ASSETS = "main.js";
    var FILE_APP_PUBLIC = "main.min.js";
    var excludedWebSitePaths = ["/", "/dashboard"];
    var requiredJavaScriptVariables = ["requirejs", "jQuery", "_", "API"];
    var requiredRequireJSModules = ["core"];
    var requiredWebPageElements = ["#playback"];
    var scripts = [];
    var stylesheets = ["project!style.css"];

    /*
     * Runtime properties.
     */

    var baseDirUrl;
    var mainFileUrl;
    var isAborted = false;
    var totalFileCount = 0;
    var loadedFileCount = 0;
    var loadedFiles = {};

    /*
     * Utilities
     */

    function removeBookmarkletScript() {
        var src = document.getElementById("plugbot-js");

        if (src) {
            src.parentElement.removeChild(src);
        }
    }

    function isWebPageIntended() {
        var currentDomain = document.domain;
        var currentPath = window.location.pathname;
        var excludedSitePath;

        if (DEBUG) {
            return true;
        } else if (currentDomain.toLowerCase() === DOMAIN.toLowerCase()) {
            for (excludedSitePath in excludedWebSitePaths) {
                if (excludedWebSitePaths.hasOwnProperty(excludedSitePath)) {
                    if (currentPath.toLowerCase() === excludedWebSitePaths[excludedSitePath].toLowerCase()) {
                        return false;
                    }
                }
            }

            return true;
        } else {
            return false;
        }
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

    function getConvertedFilePaths(listIn, projectDir) {
        var listOut = [];
        var baseDir = getBaseDir();
        var url;
        var urlProjectPrefixHead;
        var urlProjectPrefixTail;
        var i;

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

    function configureRequireJS() {
        var baseDir = getBaseDir();
        var vendorDir = baseDir + DIR_VENDOR;

        requirejs.config({
            paths: {
                plugbot: getUrlWithoutTrailingSlash(baseDir + DIR_SCRIPT),
                angular: "https://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min",
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

        configureRequireJS();

        // Make sure "angular" is required first, because "main.js" and "views/index.js" will be combined after the
        // minification process but "views/index.js" uses "angular" directly without using RequireJS. If it didn't
        // get wrapped, there would be "angular is not defined" error.
        require(["angular"], function () {
            // Require app bootstrap file.
            require([mainFile], function () {
                console.info("Plug.bot bootstrapped.");
            });
        });
    }

    /*
     * Loading files
     */

    function isFileLoaded(url) {
        return !_.isUndefined(loadedFiles[url]);
    }

    function onFileDone(url) {
        if (!isFileLoaded(url)) {
            loadedFileCount += 1;
            loadedFiles[url] = true;

            if (loadedFileCount === totalFileCount) {
                loadApp();
            }
        }
    }

    function onFileFail(url, options) {
        if (!isAborted) {
            isAborted = true;

            options.error = options.error || "Unknown";

            console.error("Plug.bot failed to load the following file, stopping now.\n" +
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
                    onFileDone(url);
                }
            },
            failCallback: function (jqXHR) {
                if (!isAborted) {
                    numRetry = numRetry || 0;

                    // Check retry times
                    if (numRetry === MAX_RETRY_TIMES) {
                        onFileFail(url, {
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
                    onFileDone(url);
                }
            },
            failCallback: function () {
                if (!isAborted) {
                    numRetry = numRetry || 0;

                    // Check retry times
                    if (numRetry === MAX_RETRY_TIMES) {
                        onFileFail(url, {
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
        var listScripts;
        var listStylesheets;
        var i;

        listScripts = getConvertedFilePaths(scripts, DIR_SCRIPT);
        listStylesheets = getConvertedFilePaths(stylesheets, DIR_STYLESHEET);

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

    function waitDependencies(dependencies, intervalCheck, validationHandler, next) {
        var idChecker;
        var index = 0;
        var dependency = dependencies[index];

        idChecker = setInterval(function () {
            if (validationHandler(dependency)) {
                index += 1;

                if (index < dependencies.length) {
                    dependency = dependencies[index];
                } else {
                    clearInterval(idChecker);
                    next();
                }
            }
        }, intervalCheck);
    }

    function waitJavaScriptVariables(next) {
        waitDependencies(requiredJavaScriptVariables, INTERVAL_WAIT_JAVASCRIPT_VARIABLES,
            function (dependency) {
                return window[dependency];
            }, next);
    }

    function waitRequireJSModules(next) {
        waitDependencies(requiredRequireJSModules, INTERVAL_WAIT_REQUIREJS_MODULES,
            function (dependency) {
                return requirejs.specified(dependency);
            }, next);
    }

    function waitWebpageElements(next) {
        waitDependencies(requiredWebPageElements, INTERVAL_WAIT_WEBPAGE_ELEMENTS,
            function (dependency) {
                return $(dependency).length;
            }, next);
    }

    /*
     * Initialization
     */

    function loadDevEnvVars() {
        // Default values
        DEBUG = false;
        BASE_DIR_TYPE = "public release";

        // Use specified values
        if (window.plugbot && window.plugbot.dev) {
            DEBUG = window.plugbot.dev.DEBUG || DEBUG;
            BASE_DIR_TYPE = window.plugbot.dev.BASE_DIR_TYPE || BASE_DIR_TYPE;
        }
    }

    function init() {
        if (isWebPageIntended()) {
            console.info("Initialize Plug.bot.");

            if (DEBUG) {
                console.warn("Plug.bot DEBUG on.");
            }

            removeBookmarkletScript();

            waitJavaScriptVariables(function () {
                waitRequireJSModules(function () {
                    waitWebpageElements(function () {
                        loadFiles();
                    });
                });
            });
        } else {
            console.error("Plug.bot not bootstrapped because the current webpage is not a plug.dj room.");
        }
    }

    loadDevEnvVars();
    init();
}());
