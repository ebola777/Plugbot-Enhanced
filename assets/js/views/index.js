angular.module('app.views', ['main.tpl.html', 'settings.tpl.html']);

angular.module("main.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("main.tpl.html",
    "<div class=\"plugbot-window plugbot-main\"\n" +
    "     data-window\n" +
    "     data-draggable\n" +
    "     data-drag-id=\"main\"\n" +
    "     data-drag-z-index=\"1000000\"\n" +
    "     data-drag-containment=\"#app\"\n" +
    "     data-drag-iframe-fix=\"#yt-frame\"\n" +
    "     data-drag-handle=\".handle\"\n" +
    "     data-drag-grid=\"[4, 4]\"\n" +
    "     data-drag-snap=\".app-header, #audience, #dj-booth, #playback-container, #dj-button, #vote, .app-right, #footer\"\n" +
    "     data-drag-snap-mode=\"outer\"\n" +
    "     data-drag-snap-tolerance=\"8\"\n" +
    "     data-drag-no-overlap=\".app-header, #footer\"\n" +
    "     data-drag-keep-zoom=\"#app\"\n" +
    "     data-ng-controller=\"MainCtrl\">\n" +
    "    <div class=\"handle\">\n" +
    "        <span class=\"title\">Plugbot</span>\n" +
    "        <span class=\"handle-buttons\">\n" +
    "            <i class=\"icon icon-settings-white\" data-window-id=\"settings\" data-window-toggle=\".plugbot-settings\"></i>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"body\">\n" +
    "        <ul>\n" +
    "            <li class=\"item\"\n" +
    "                data-ng-class=\"{ 'enabled': isEnabled(item) }\"\n" +
    "                data-ng-repeat=\"item in items\"\n" +
    "                data-ng-click=\"switchEnabled(item)\">{{item.text}}</li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("settings.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("settings.tpl.html",
    "<div class=\"plugbot-window plugbot-settings\"\n" +
    "     data-window=\"hide\"\n" +
    "     data-draggable\n" +
    "     data-drag-id=\"settings\"\n" +
    "     data-drag-z-index=\"1000000\"\n" +
    "     data-drag-containment=\"#app\"\n" +
    "     data-drag-iframe-fix=\"#yt-frame\"\n" +
    "     data-drag-handle=\".handle\"\n" +
    "     data-drag-grid=\"[8, 8]\"\n" +
    "     data-drag-snap=\"#app\"\n" +
    "     data-drag-snap-mode=\"inner\"\n" +
    "     data-drag-snap-tolerance=\"16\"\n" +
    "     data-drag-no-overlap=\".app-header, #footer\"\n" +
    "     data-drag-keep-zoom=\"#app\"\n" +
    "     data-ng-controller=\"SettingsCtrl\">\n" +
    "    <div class=\"handle\">\n" +
    "        <span class=\"title\">Settings</span>\n" +
    "        <span class=\"handle-buttons\">\n" +
    "            <i class=\"icon icon-dialog-close\" data-window-id=\"close\"></i>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"body\">\n" +
    "        <ul>\n" +
    "            <li class=\"item\"\n" +
    "                data-ng-repeat=\"item in items\"\n" +
    "                data-ng-click=\"item.click()\">{{item.text}}</li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
