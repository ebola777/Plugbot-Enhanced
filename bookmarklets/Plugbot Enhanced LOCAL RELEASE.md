# Local Release

Drag the following link into the bookmarks bar:

<a href="javascript: (function () {
var script = document.createElement('script');
var protocol = 'https://';
var baseUrl = 'localhost/Plugbot-Enhanced/';
var file = 'public/js/bootstrap.min.js';
window.plugbot = {
    dev: {
        DEBUG: false,
        BASE_DIR_TYPE: 'public debug'
    }
};
script.setAttribute('id', 'plugbot-js');
script.setAttribute('src', protocol + baseUrl + file);
document.body.appendChild(script); }());">Plugbot Enhanced LOCAL RELEASE</a>

This bookmarklet will do the following things upon clicking:

1. Initialize globals as follows:

    ```JavaScript
    window.plugbot = {
        dev: {
            DEBUG: false,
            BASE_DIR_TYPE: 'public debug'
        }
    };
    ```

2. Inject `bootstrap.min.js` from localhost
