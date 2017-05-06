function Utils() {
}

/**
 *
 * @param {String} url
 * @param {function(String)} callback
 * @param {String} params
 * @param {POST | GET} method
 * @param {{'ket': 'value'}} header
 */
Utils.prototype.request = function(options, callback, errorCallback) {
    //url, params, method, header
    var xhr = new XMLHttpRequest();
    var url = options.url;
    var params = options.params || null;
    var method = options.method || 'GET';
    var header = options.header || null;

    xhr.open(method, url, true);
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                if(callback) {
                    var respons = this.response || this.responseText;
                    callback(respons);
                }
            } else {
                if(errorCallback) {
                    errorCallback();
                }
            }
        }
    };

    if (header) {
        for (var key in header) {
            xhr.setRequestHeader(key, header[key]);
        }
    }

    xhr.send(params);
};

Utils.prototype.send = function(obj) {
    chrome.runtime.sendMessage(obj);
};

Utils.prototype.guid = function(obj) {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }
      return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
      }();
  }