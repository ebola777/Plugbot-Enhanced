# Local Debug

Drag the following link into the bookmarks bar:

<a href="javascript: (function () {
var script = document.createElement('script');
var protocol = 'https://';
var baseUrl = 'localhost/Plugbot-Enhanced/';
var file = 'assets/js/bootstrap.js';
window.plugbot = {
    dev: {
        DEBUG: true,
        BASE_DIR_TYPE: 'assets debug'
    }
};
script.setAttribute('id', 'plugbot-js');
script.setAttribute('src', protocol + baseUrl + file);
document.body.appendChild(script); }());">Plugbot Enhanced LOCAL DEBUG</a>

This bookmarklet will do the following things upon clicking:

1. Initialize globals as follows:

    ```JavaScript
    window.plugbot = {
        dev: {
            DEBUG: true,
            BASE_DIR_TYPE: 'assets debug'
        }
    };
    ```

2. Inject `bootstrap.js` from localhost
