/*global module: false */

var FILE_CONFIG_COMPASS = './config/compile/compass.rb';

/**
 * @param {Object} grunt    Grunt instance
 * @return {undefined}
 */
module.exports = function (grunt) {
    'use strict';

    return {
        init: function () {
            this.initGrunt()
                .loadTasks()
                .registerTasks();
        },
        initGrunt: function () {
            grunt.initConfig({
                requirejs: {
                    options: {
                        optimize: 'uglify2',
                        uglify2: {
                            output: {
                                beautify: false
                            },
                            warnings: true,
                            global_defs: {
                                DEBUG: false
                            }
                        }
                    },
                    bootstrap: {
                        options: {
                            baseUrl: './assets/js/',
                            name: 'bootstrap',
                            out: './public/js/bootstrap.min.js',
                            paths: {
                                angular: 'empty:'
                            },
                            onBuildRead: function (moduleName, pathIn, contents) {
                                return this.disableDebug(contents);
                            },
                            disableDebug: function (contents) {
                                var REGEX = /\s+VAR_AUTO_DEBUG\s*=\s*(true|false|1|0)\s*/g,
                                    REPLACE_WITH = ' VAR_AUTO_DEBUG = false',
                                    match = REGEX.exec(contents),
                                    posBegin,
                                    posEnd,
                                    ret = contents;

                                if (null !== match) {
                                    posBegin = match.index;
                                    posEnd = posBegin + match[0].length;

                                    ret = contents.substr(0, posBegin) +
                                    REPLACE_WITH +
                                    contents.substr(posEnd);
                                }

                                return ret;
                            }
                        }
                    },
                    main: {
                        options: {
                            baseUrl: './generated/js/',
                            name: 'main',
                            out: './public/js/main.min.js',
                            paths: {
                                angular: 'empty:',
                                plugbot: './'
                            },
                            deps: ['plugbot/app'],
                            generateSourceMaps: false,
                            preserveLicenseComments: true
                        }
                    }
                },
                compass: {
                    options: {
                        config: FILE_CONFIG_COMPASS,
                        force: true
                    },
                    debug: {
                        options: {
                            environment: 'development',
                            trace: true,
                            debugInfo: true
                        }
                    },
                    release: {
                        options: {
                            environment: 'production',
                            outputStyle: 'expanded'
                        }
                    }
                },
                cssmin: {
                    release: {
                        expand: true,
                        cwd: './assets/css/',
                        src: '**/*.css',
                        dest: './public/css/',
                        ext: '.css'
                    }
                },
                uglify: {
                    options: {
                        preserveComments: 'some',
                        sourceMap: true
                    },
                    vendor: {
                        files: [{
                            // requirejs-domready
                            expand: true,
                            cwd: './public/vendor/requirejs-domready/js/',
                            src: '*.js',
                            dest: './public/vendor/requirejs-domready/js/',
                            ext: '.min.js'
                        }]
                    }
                },
                html2js: {
                    options: {
                        module: 'app.views',
                        base: './assets/html/'
                    },
                    views: {
                        src: ['./assets/html/**/*.tpl.html'],
                        dest: './assets/js/views/index.js'
                    }
                },
                ngAnnotate: {
                    options: { },
                    main: {
                        files: [{
                            expand: true,
                            cwd: './assets/js/',
                            src: [
                                './controllers/**/*.js',
                                './directives/**/*.js',
                                './services/**/*.js',
                                './views/**/*.js',
                                './app.js',
                                './main.js'
                            ],
                            dest: './generated/js/',
                            ext: '.js'
                        }]
                    }
                },
                copy: {
                    vendor: {
                        files: [{
                            // requirejs-domready
                            expand: true,
                            cwd: './bower_components/requirejs-domready/',
                            src: ['*.js', '*.map', '!Gruntfile.js'],
                            dest: './public/vendor/requirejs-domready/js/'
                        }]
                    }
                },
                clean: {
                    generated: [
                        './generated/js/'
                    ],
                    debug: [
                        './assets/css/'
                    ],
                    release: [
                        './public/js/',
                        './public/css/'
                    ],
                    vendor: [
                        './public/vendor/requirejs-domready/'
                    ]
                },
                watch: {
                    views: {
                        files: ['./assets/html/**/*.tpl.html'],
                        tasks: ['Assemble HTML'],
                        options: {
                            spawn: false
                        }
                    }
                }
            });

            return this;
        },
        loadTasks: function () {
            grunt.loadNpmTasks('grunt-contrib-clean');
            grunt.loadNpmTasks('grunt-contrib-compass');
            grunt.loadNpmTasks('grunt-contrib-copy');
            grunt.loadNpmTasks('grunt-contrib-cssmin');
            grunt.loadNpmTasks('grunt-contrib-requirejs');
            grunt.loadNpmTasks('grunt-contrib-uglify');
            grunt.loadNpmTasks('grunt-contrib-watch');
            grunt.loadNpmTasks('grunt-html2js');
            grunt.loadNpmTasks('grunt-ng-annotate');

            return this;
        },
        registerTasks: function () {
            grunt.registerTask('Assemble Debug', [
                'compass:debug'
            ]);

            grunt.registerTask('Assemble Release', [
                'clean:generated',
                'clean:release',
                'html2js:views',
                'ngAnnotate:main',
                'requirejs:bootstrap',
                'requirejs:main',
                'compass:release',
                'cssmin:release'
            ]);

            grunt.registerTask('Assemble HTML', [
                'html2js:views'
            ]);

            grunt.registerTask('Copy Bower Vendor', [
                'clean:vendor',
                'copy:vendor',
                'uglify:vendor'
            ]);

            grunt.registerTask('Purge Debug', [
                'clean:debug'
            ]);

            grunt.registerTask('Purge Release', [
                'clean:release'
            ]);

            grunt.registerTask('Watch HTML', [
                'watch:views'
            ]);
        }
    }.init();
};
