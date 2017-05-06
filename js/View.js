function View(email) {
    this.ico = {
        'activ': 'img/ico_panel_activ.png',
        'notActiv': 'img/ico_panel.png'
    };
    this.messNotif = {};
    this.init();
};

View.prototype.init = function() {
    this.addListener();
};
View.prototype.showNumber = function() {
    var unread = 0;
    var users = app.account.users;
    if (app.account.status) {
        for (var key in users) {
            unread += users[key].count;
        }
    } else {
        unread = -1;
    }
    // if (getinfo.error || request.error) {
    //     unread = -1;
    // } else {
    //     for (var key in users) {
    //         if (!users[key].error) {
    //             unread += users[key].viewunread;
    //         }
    //     }
    // }
    if(unread > 999) {
        unread = "999+";
    }

    if (unread == -1) {
        chrome.browserAction.setBadgeText({
            text: "?"
        });
        chrome.browserAction.setIcon({
            path: this.ico['notActiv']
        });
        chrome.browserAction.setBadgeBackgroundColor({
            color: [190, 190, 190, 230]
        });
    } else {
        var col = (unread == 0) ? '' : unread + '';

        chrome.browserAction.setBadgeText({
            text: col
        });
        chrome.browserAction.setIcon({
            path: this.ico['activ']
        });
        chrome.browserAction.setBadgeBackgroundColor({
            color: '#ff536a'//[255, 171, 0, 255]
        });
    }
};
View.prototype.addListener = function() {
    chrome.notifications.onClosed.addListener(function callback(notificationId, byUser) {

        delete(this.messNotif[notificationId]);
    }.bind(this));

    chrome.notifications.onClicked.addListener(function callback(notificationId) {
        var item = this.messNotif[notificationId];
        openTab.openNewMess(item.mess.id, item.email);

        delete(this.messNotif[notificationId]);
    }.bind(this));

    chrome.notifications.onButtonClicked.addListener(function callback(notificationId, buttonIndex) {
        if (buttonIndex == 0) {
            var item = this.messNotif[notificationId];
            openTab.openNewMess(item.mess.id, item.email);
        }

        delete(this.messNotif[notificationId]);
    }.bind(this));
};
View.prototype.notifications = function(mess, email) {
    app.sound.play();
    var name = getFromName(mess);
    var avatar = mess.correspondents.from[0].avatars['50x50'].replace(/&amp;/g, '&');
    var subject = mess.subject.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
    var snippet = mess.snippet.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
    var opt = {
        type: "basic",
        title: name,
        message: subject == '' ? 'Без темы': subject,
        contextMessage: snippet,
        iconUrl: avatar,
        buttons: [
            {title: "Прочитать"},
            {title: "Закрыть"}
        ]
    };

    if (JSON.parse(localStorage["view_notif"])) {
        chrome.notifications.create("", opt, function(notificationId){
            this.messNotif[notificationId] = {'mess': mess, 'email': email};
            setTimeout(function() {
                chrome.notifications.clear(notificationId, function(){})
            }, 10000);
        }.bind(this));
    }
};
