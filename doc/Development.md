## Prerequisites

### Platforms

- [Node.js](http://nodejs.org/)

### NPM Packages

- [Grunt CLI](http://gruntjs.com/getting-started#installing-the-cli)
- [Bower](http://bower.io/#install-bower)
- [http-server](https://github.com/nodeapps/http-server#installing-globally)

## Install

1. Run `npm install` in root folder.
2. Run `bower install` in `./assets` and `./public` folders.

## Debug

1. Run Grunt task "Run Local HTTPS Server".
2. Open browser and navigate to [Localhost](https://localhost).
3. Ignore certificate warning.
4. Use bookmarklets in `./bookmarklets/` to load Plug.bot files.

## Building Release

1. Modify "version" in `./assets/js/services/Export.js`.
2. Run Grunt task "Build Release".

Results are in `./public/` folder.

## Converting HTML Templates to AngularJS HTML Templates

Run Grunt task "Convert HTML Templates" to convert and merge all
"*.tpl.html" files in `./assets/html/` into `./assets/js/views/index.js`.

Run Grunt task "Watch HTML Templates" to compile automatically upon file changes.

## File Structure

    .
    +-- assets/ (Source files)
    |   +-- bower_components/ (Bower packages)
    |   +-- css/ (CSS files generated from Sass files)
    |   +-- html/ (HTML templates)
    |   +-- js/ (JavaScript files)
    |       +-- controllers/ (AngularJS controllers)
    |       +-- directives (AngularJS directives)
    |       +-- services (AngularJS services)
    |       +-- views (AngularJS views generated from HTML templates)
    |       +-- .eslintrc (ESLint configuration file)
    |       +-- app.js (Application file)
    |       +-- bootstrap.js (Site bootstrap file, entry file, prepare dependencies)
    |       +-- main.js (Application bootstrap file, load dependencies)
    |   +-- sass/ (Sass files)
    |   +-- bower.json (Bower configuration file, same as "public/bower.json")
    +-- bookmarklets/ (Bookmarklets used to initialize Plug.bot on plug.dj web pages)
    +-- doc/ (Documentation)
    +-- generated/ (Generated files by NPM package ng-annotate)
    +-- node_modules/ (NPM packages)
    +-- preferences/ (Preference files which are not related to running the code)
    +-- public/ (Files for production use)
    |   +-- bower_components/ (Bower packages)
    |   +-- css/ (Minified CSS files)
    |   +-- js/ (Minified JavaScript files)
    |   +-- bower.json (Bower configuration file, same as "assets/bower.json")
    +-- .gitattributes (Git configuration file, defining attributes per path)
    +-- .gitignore (Git configuration file, specifying intentionally untracked files to ignore)
    +-- CHANGELOG.md (Project changelog)
    +-- config.rb (Compass configuration file)
    +-- Gruntfile.js (Grunt task configuration file)
    +-- LICENSE (Project license)
    +-- package.json (NPM configuration file)
    +-- README.md (Project readme)
