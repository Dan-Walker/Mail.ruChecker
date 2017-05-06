function Account() {
    this.url = 'https://portal.mail.ru/NaviData?mac=1';
    this.status = false;
	this.timeout = 1000 * 60;
	this.users = {};
    this.timeoutId = null;

	this.init();
};

Account.prototype.init = function() {
	this.getEmail();
};

Account.prototype.startEmailTimeout = function() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(this.getEmail.bind(this), this.timeout);
};

Account.prototype.getEmail = function() {
	app.utils.request({
        url: this.url,
        method: "GET"
    }, this.parsResult.bind(this), this.errorRequest.bind(this));
};

Account.prototype.errorRequest = function() {
	this.startEmailTimeout();
};

Account.prototype.parsResult = function(data) {
	var result = JSON.parse(data);

	if (result.status == 'ok') {
		var emails = result.data.list;
		this.status = true;
		for (var key in emails) {
			this.addUser(emails[key]);
		}
	} else {
		this.status = false;
		app.view.showNumber();
	}

	this.startEmailTimeout();
};

Account.prototype.addUser = function(email) {
	if (this.users[email] == undefined) {
		this.users[email] = new User(email);
	}
};

Account.prototype.start = function () {
    this.init();
    for (var key in this.users) {
        this.users[key].start();
    }
};

Account.prototype.pause = function() {
    clearTimeout(this.timeoutId);
    for (var key in this.users) {
        this.users[key].pause();
    }
};