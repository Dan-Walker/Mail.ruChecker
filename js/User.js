function User(email) {
	this.timeout = localStorage["timetest"] == null ? 30000 : localStorage["timetest"];
	this.count = 0;
	this.excludeFolder = ['950', '500000', '500001', '500002']; //'500000' отправленные '500001' черновики
	this.email = email;
	this.userExcludeFolder = this.getUserExcludeFolder();
	this.guid = app.utils.guid();
	this.status = false;
	this.token = null;
	this.folders = null;
	this.messages = null;
    this.timeoutTokenId = null;
    this.timeoutFoldersId = null;

	this.init();
};

User.prototype.init = function() {
	this.getToken();
};

User.prototype.start = function() {
    this.init();
};

User.prototype.pause = function() {
    clearTimeout(this.timeoutTokenId);
    clearTimeout(this.timeoutFoldersId);
};

User.prototype.startTimeoutToken = function() {
    clearTimeout(this.timeoutTokenId);
    this.timeoutTokenId = setTimeout(this.getToken.bind(this), this.timeout);
}
User.prototype.getToken = function() {
	var url = 'https://mailru-checker-api.e.mail.ru/api/v1/tokens?email=' + this.email + '&x-email=' + this.email;
	app.utils.request({
		url: url,
        method: "GET"
    }, this.parsTokenResult.bind(this), this.errorRequestToken.bind(this))
};

User.prototype.getTokenSdc = function() {
    var url = 'https://mailru-checker-api.e.mail.ru/api/v1/tokens?email=' + this.email + '&x-email=' + this.email;
    var urlSdc = 'https://auth.mail.ru/sdc?from=' + decodeURIComponent(url);
    app.utils.request({
        url: urlSdc,
        method: "GET"
    }, this.parsTokenSdcResult.bind(this), this.errorRequestToken.bind(this))
};


User.prototype.errorRequestToken = function() {
	this.status = false;
	this.countUnreadMess();
	this.startTimeoutToken();
};
User.prototype.parsTokenSdcResult = function(data) {
    var result = JSON.parse(data);
    if (result.status == 200) {
        this.status = true;
        this.token = result.body.token;
        this.getData();
    } else {
        this.status = false;
        this.startTimeoutToken();
    }
};
User.prototype.parsTokenResult = function(data) {
	var result = JSON.parse(data);
	if (result.status == 200) {
		this.status = true;
		this.token = result.body.token;
		this.getData();
	} else if (result.status == 403 && result.body == 'nosdc') {
        this.getTokenSdc();
    } else {
		this.status = false;
		this.startTimeoutToken();
	}
};

User.prototype.getData = function() {
	this.getFolders();
	//this.getMessagesUnread();
};

User.prototype.startTimeoutFolders = function() {
    clearTimeout(this.timeoutFoldersId);
    this.timeoutFoldersId = setTimeout(this.getFolders.bind(this), this.timeout);
};

User.prototype.getFolders = function() {
	if (this.token == null) {
		this.getToken();
		return;
	}
	var url = 'https://mailru-checker-api.e.mail.ru/api/v1/folders?email=' + this.email + '&x-email=' + this.email + '&token=' + this.token + '&limit=100&last_modified=0';
	app.utils.request({
		url: url,
        method: "GET"
    }, this.parsFoldersResult.bind(this), this.errorRequestFolders.bind(this));
};
User.prototype.errorRequestFolders = function() {
	this.status = false;
	this.countUnreadMess();
	this.startTimeoutFolders();
};
User.prototype.parsFoldersResult = function(data) {
	var result = JSON.parse(data);
	if (result.status == 200) {
		this.status = true;
		this.folders = result.body;
	} else {
		this.status = false;
		this.clear();
	}

	this.countUnreadMess();
	this.startTimeoutFolders();
};

User.prototype.countUnreadMess = function(data) {
	var countMess = 0;
	for (var key in this.folders) {
		var id = this.folders[key].id;
		if (!~this.excludeFolder.indexOf(id)) {
			if (this.userExcludeFolder.length != 0) {
				if (!~this.userExcludeFolder.indexOf(id)) {
					countMess += this.folders[key].messages_unread;
				}
			} else {
				countMess += this.folders[key].messages_unread;
			}
			
		}
	}

	if (this.count != countMess) {
		this.getMessagesUnread();
	}

	this.count = countMess;
	app.view.showNumber();
};

User.prototype.getMessagesUnread = function() {
	var url = 'https://mailru-checker-api.e.mail.ru/api/v1/messages/status/unread?email=' + this.email + '&x-email=' + this.email + '&token=' + this.token + '&limit=100&last_modified=0';
	app.utils.request({
		url: url,
        method: "GET"
    }, this.parsMessagesUnread.bind(this));
};

User.prototype.parsMessagesUnread = function(data) {
	var result = JSON.parse(data);

	if (result.status == 200) {
		var notifMess = this.checkMessages(result.body);
		this.messages = result.body;
	}

	//Залипает
	if (notifMess.length > 0) {
		app.view.notifications(notifMess[0], this.email);
	}
};

User.prototype.checkMessages = function(newMess) {
	if (newMess == null || this.messages == null) {
		return [];
	}

	var idsOldMess = this.messages.map(function(item) {
		return item.id; 
	});

	var result = newMess.filter(function(item) { 
		if (this.userExcludeFolder.length != 0) {
			if (!~this.userExcludeFolder.indexOf(item.folder)) {
				return !~idsOldMess.indexOf(item.id);
			}
		} else {
			return !~idsOldMess.indexOf(item.id);
		}
		return false;
	}.bind(this));

	return result;
};

User.prototype.getUserExcludeFolder = function(folders) {
	if (localStorage["userExcludeFolder"] != undefined) {
		var result = JSON.parse(localStorage["userExcludeFolder"]);
		if (result[this.email] != undefined) {
			return result[this.email];
		}
	}
	return [];
};
User.prototype.setUserExcludeFolder = function(folders) {
	this.userExcludeFolder = folders;
	var saveObj = {};
	saveObj[this.email] = this.userExcludeFolder;
	if (localStorage["userExcludeFolder"] != undefined) {
		saveObj = JSON.parse(localStorage["userExcludeFolder"]);
		saveObj[this.email] = this.userExcludeFolder;
	}

	localStorage["userExcludeFolder"] = JSON.stringify(saveObj);
};

User.prototype.clear = function() {
	this.token = null;
	this.folders = null;
	this.messages = null;
	this.count = 0;
};