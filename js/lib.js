function shortTime(str) {
    var currentDate = new Date();
    var date = new Date(str * 1000);
    var str = '';

    if (currentDate.getDate() == date.getDate()) {
        str += date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        str += ':';
        str += date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    } else {
        str += date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        str += '.';
        str += date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
        str += '.' + date.getFullYear();
    }
    
    return str;
}

function getFromName(mess) {
    var result = mess.correspondents.from[0].email;
    if (mess.correspondents.from[0].name) {
        result = mess.correspondents.from[0].name;
    }
    result = decodeRU(result);
    return result;
}

function decodeRU(str) {
    var arrStr = str.split("@");
    if(arrStr.length > 1) {
        str = arrStr[0] + '@' + punycode.toUnicode(arrStr[1]);
    } else {
        str = punycode.toUnicode(str);
    }
    
    return str;
}

// function htmlspecialchars(r){
//     return r.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g, "&");
// }