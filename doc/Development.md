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

## How to Release

If you haven't installed Grunt yet, run `npm install` first

1. Make sure
`VAR_AUTO_DEBUG`     is **true** and
`RELEASE_LOCAL_REPO` is **false** in `./assets/js/bootstrap.js`
2. Modify `VERSION` in `./assets/js/services/Export.js`
3. Run `Assemble HTML` Grunt task in case views haven't been converted
4. Run `Assemble Release` Grunt task
