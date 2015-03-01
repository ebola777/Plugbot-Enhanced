/* eslint-env node */

"use strict";

module.exports = function (grunt) {
    /*
     * Initialize configurations
     */

    grunt.initConfig({
        requirejs: {
            options: {
                optimize: "uglify2",
                uglify2: {
                    output: {
                        beautify: false
                    },
                    compress: {
                        sequences: false,
                        "global_defs": {
                            DEBUG: false
                        }
                    },
                    warnings: true,
                    mangle: false
                }
            },
            bootstrap: {
                options: {
                    baseUrl: "./assets/js/",
                    name: "bootstrap",
                    out: "./public/js/bootstrap.min.js",
                    paths: {
                        angular: "empty:"
                    }
                }
            },
            main: {
                options: {
                    baseUrl: "./generated/js/",
                    name: "main",
                    out: "./public/js/main.min.js",
                    include: ["plugbot/app"],
                    paths: {
                        plugbot: "./",
                        angular: "empty:",
                        domReady: "empty:"
                    },
                    generateSourceMaps: false,
                    preserveLicenseComments: true
                }
            }
        },
        compass: {
            options: {
                config: "./config.rb",
                force: true
            },
            debug: {
                options: {
                    environment: "development",
                    trace: true,
                    debugInfo: true
                }
            },
            release: {
                options: {
                    environment: "production",
                    outputStyle: "expanded"
                }
            }
        },
        cssmin: {
            release: {
                expand: true,
                cwd: "./assets/css/",
                src: "**/*.css",
                dest: "./public/css/",
                ext: ".css"
            }
        },
        html2js: {
            options: {
                module: "app.views",
                base: "./assets/html/"
            },
            htmlTemplates: {
                src: ["./assets/html/**/*.tpl.html"],
                dest: "./assets/js/views/index.js"
            }
        },
        ngAnnotate: {
            options: {},
            main: {
                files: [{
                    expand: true,
                    cwd: "./assets/js/",
                    src: [
                        "./controllers/**/*.js",
                        "./directives/**/*.js",
                        "./services/**/*.js",
                        "./views/**/*.js",
                        "./app.js",
                        "./main.js"
                    ],
                    dest: "./generated/js/",
                    ext: ".js"
                }]
            }
        },
        clean: {
            debug: [
                "./assets/css/"
            ],
            release: [
                "./public/js/",
                "./public/css/"
            ],
            generated: [
                "./generated/js/"
            ]
        },
        watch: {
            htmlTemplates: {
                files: ["./assets/html/**/*.tpl.html"],
                tasks: ["Convert HTML Templates"],
                options: {
                    spawn: false
                }
            }
        },
        shell: {
            runLocalHttpsServer: {
                command: "http-server ../" +
                " -p 443 -a localhost" +
                " --ssl" +
                " --cert ./preferences/Certificates/ryans-cert.pem" +
                " --key ./preferences/Certificates/ryans-key.pem"
            }
        }
    });

    /*
     * Load tasks
     */

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-compass");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-html2js");
    grunt.loadNpmTasks("grunt-ng-annotate");
    grunt.loadNpmTasks("grunt-shell");

    /*
     * Register tasks
     */

    grunt.registerTask("Build Debug", [
        "compass:debug"
    ]);

    grunt.registerTask("Build Release", [
        "clean:generated",
        "clean:release",
        "html2js:htmlTemplates",
        "ngAnnotate:main",
        "requirejs:bootstrap",
        "requirejs:main",
        "compass:release",
        "cssmin:release"
    ]);

    grunt.registerTask("Convert HTML Templates", [
        "html2js:htmlTemplates"
    ]);

    grunt.registerTask("Clean Debug", [
        "clean:debug"
    ]);

    grunt.registerTask("Clean Release", [
        "clean:generated",
        "clean:release"
    ]);

    grunt.registerTask("Watch HTML Templates", [
        "watch:htmlTemplates"
    ]);

    grunt.registerTask("Run Local HTTPS Server", [
        "shell:runLocalHttpsServer"
    ]);
};
