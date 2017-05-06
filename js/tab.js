var referer = 'referer=mailchecker';

var openTab = {
    newMessUrl: {
        'win': 'http://e.mail.ru/compose/?' + referer,
        'tel': 'http://touch.mail.ru/cgi-bin/msglist?' + referer + '#sentmsg'
    },
    messUrl : {
        'win' : 'http://e.mail.ru/cgi-bin/readmsg?' + referer + '&id=',
        'tel' : 'http://touch.mail.ru/cgi-bin/msglist?' + referer + '#readmsg/'
    },
    homeMailUrl : {
        'win' : 'http://e.mail.ru/cgi-bin/msglist?' + referer,
        'tel' : 'http://touch.mail.ru/cgi-bin/msglist?' + referer + '#msglist'
    },

    loginUrl: {
        'win' : 'http://e.mail.ru/cgi-bin/login?' + referer,
        'tel' : 'http://touch.mail.ru/cgi-bin/login?' + referer  
    },
    
    unreadUrl : {
        'win' : 'http://e.mail.ru/search/?q_read=2&q_folder=all&' + referer,
        'tel' : 'http://touch.mail.ru/cgi-bin/msglist?' + referer + '#search/unread'
    },

    urlSwitchLogin : 'https://auth.mail.ru/cgi-bin/auth?Page=',
    settingsUrl : "http://e.mail.ru/cgi-bin/options?" + referer,

    settingsApp : chrome.extension.getURL("options.html"),
    homeUrl: "http://www.mail.ru/?" + referer,

    openHome : function () {
        var url = this.homeUrl;
        openTab.open(url);
    },

    openSettings : function (){
        var url = this.settingsApp;
        openTab.open(url);
    },

    createNewMess : function (uid){
        var url = openTab.getMailUrl(this.newMessUrl[localStorage["interface"]], uid);
        openTab.open(url);
    },

    openNewMess : function (id, email) {
        var url = openTab.getMailUrl(this.messUrl[localStorage["interface"]] + id, email);
        openTab.open(url);
    },

    goToInbox : function (uid) {
        var url = openTab.homeMailUrl[localStorage["interface"]];
        if(uid) {
            url = openTab.getMailUrl(openTab.homeMailUrl[localStorage["interface"]], uid);
        }

        openTab.open(url)
    },

    goToAllUnread : function (uid) {
        var url = openTab.getMailUrl(openTab.unreadUrl[localStorage["interface"]], uid);
        openTab.open(url);
    },

    goToLogin: function() {
        var url = openTab.loginUrl[localStorage["interface"]];
        openTab.open(url);
    },

    open : function (openUrl){
        var that = this;
        chrome.tabs.create({
            url: openUrl
        });
    },

    getMailUrl : function (page, uid) {
        return 'https://auth.mail.ru/cgi-bin/auth?Page=' + encodeURIComponent(page) + '&Login=' + uid;
    },

    switchIcoAction : function() {
        chrome.browserAction.onClicked.removeListener(openTab.wrapperAction);
        chrome.browserAction.setPopup({'popup': ''});
        if (JSON.parse(localStorage["modal_views"])) {
           chrome.browserAction.setPopup({'popup': 'popup.html'});
        } else {
           chrome.browserAction.onClicked.addListener(openTab.wrapperAction);
        }
    },

    wrapperAction : function() {
        openTab.goToInbox();
    }
}
//chrome.browserAction.onClicked.addListener(function(tab) {
//    _gaq.push(['_trackEvent', 'Mail_button_click', 'clicked']);
//    openTab.goToInbox();
//});