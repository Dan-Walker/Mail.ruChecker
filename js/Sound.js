function Sound() {
	this.status = true;
	this.audioElem = null;

	this.init();
}

Sound.prototype.init = function() {
	this.audioElem = document.createElement('audio');
	this.setTrack();
}

Sound.prototype.setTrack = function() {
	try {
		this.audioElem.src = 'sound/' + localStorage["soundtrek"];
	} catch (e) {
		console.error(e);
	}
}

Sound.prototype.play = function() {
	if (localStorage["soundtrek"] != '0'){
		this.setTrack();
		try {
			this.audioElem.play();
		} catch (e) {
			console.error(e);
		}
	}
};