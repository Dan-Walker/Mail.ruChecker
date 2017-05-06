document.addEventListener('DOMContentLoaded', main, false);
var app = {};

function main () {
    initSettings();
    app.sound = new Sound();
    app.utils = new Utils();
    app.view = new View();
    app.account = new Account();

    openTab.switchIcoAction();

    var states = {
        active: 'active',
        locked: 'locked',
        idle: 'idle'
    };

    var prevState = states.active;

    chrome.idle.onStateChanged.addListener(function (newState) {
        if (newState === states.active && prevState !== states.idle) {
            app.account.start();
        }
        else if (newState === states.locked) {
            app.account.pause();
        }
        prevState = newState;
    });
}

function initSettings() {
    if (localStorage["interface"] == undefined) {
        localStorage["interface"] = 'win';
    }
    if (localStorage["interface"] == 'pro') {
        localStorage["interface"] = 'win';
    }

    if (localStorage["view_notif"] == undefined) {
        localStorage["view_notif"] = true;
    }
    if (localStorage["modal_views"] == undefined) {
        localStorage["modal_views"] = true;
    }
    if (localStorage["view_photo"] == undefined) {
        localStorage["view_photo"] = true;
    }
    if (localStorage["soundtrek"] == undefined) {
        localStorage["soundtrek"] = '4.ogg';
    }
    if (localStorage["timetest"] == undefined) {
        localStorage["timetest"] = 30000;
    }
}

chrome.extension.onRequest.addListener (
    function(request, sender, sendResponse) {
        sendResponse({
            val: localStorage[request.value]
        });
    }
);

//GA
var _gaq = _gaq || [];
//_gaq.push(['_setAccount', 'UA-26947089-1']);
_gaq.push(['_setAccount', 'UA-26947089-2']);
_gaq.push(['_setCustomVar', 1, 'interface', localStorage["interface"], 3]);
_gaq.push(['_setCustomVar', 3, 'view_notif', localStorage["view_notif"], 3]);
_gaq.push(['_setCustomVar', 4, 'modal_views', localStorage["modal_views"], 3]);
_gaq.push(['_setCustomVar', 2, 'version', chrome.runtime.getManifest().version, 3]);
_gaq.push(['_trackPageview']);
    
(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();