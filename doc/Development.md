## Prerequsites

- [Node.js](http://nodejs.org/)
- Local HTTP server
- Local SSL tunnel

## Recommended IDEs and Tools

- IntelliJ (Windows)
- Sublime Text
- HTTP File Server (Windows)
- Stunnel

## Install Node Packages

Run `npm install` in root directory

## Install Bower Packages

Install Bower via `npm install -g bower`,
and run `bower install` in root directory

## Convert HTML to AngularJS Javascript

Run `Assemble HTML` Grunt task to
convert and merge all *.tpl.html files in `./assets/html/` to `./assets/js/views/index.js`

Run `Watch HTML` Grunt task to watch changes and compile automatically

## How to Release

If you haven't installed Grunt yet, run `npm install` first, 
and run `npm install -g grunt-cli` to install Grunt CLI

1. Make sure `RELEASE_LOCAL_REPO` is **false** in `./assets/js/bootstrap.js`
2. Modify `version` in `./assets/js/services/Export.js`
3. Run `Assemble Release` Grunt task

Source files inside `./assets/` will be compiled and compressed into `./public/` folder
