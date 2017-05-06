var backgroundPage = chrome.extension.getBackgroundPage();

backgroundPage._gaq.push(['_trackPageview'], 'popup.html');
            
function init(){
    document.getElementsByClassName('gomail')[0].addEventListener('click', function () {
        backgroundPage.openTab.openHome();
        window.close();
        return false;
    });
    document.getElementsByClassName('settings')[0].addEventListener('click', function () {
        backgroundPage.openTab.openSettings();
        window.close();
        return false;
    });
    document.getElementsByClassName('update')[0].addEventListener('click', function () {
        loadingView();
        viewMesg();
        return false;
    });
    
    viewMesg();
}
            
function viewMesg() {
    var users = backgroundPage.app.account.users;
    var flagAuth = false;
    document.getElementById('content').innerHTML = '';
    
    for(var key in users) {
        var userItem = users[key];

        if(users[key].status) {
            flagAuth = true;

            insertMess(userItem.messages, userItem.email, userItem.guid, userItem.count);
            addEvent(userItem.email, userItem.guid);
        }
    }

    if(!flagAuth) {
        notAuth();
    }   
}

function getTextAllMess(counts) {
    switch (counts % 100) {
        case 11:
        case 12:
        case 13:
        case 14:
            return 'ем';
        default:
            switch(counts % 10) {
                case 1:
                    return 'ьмо';
                case 2:
                case 3:
                case 4:
                    return 'ьма';
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 0:
                    return 'ем';
            }
    }
}
            
function insertMess(mess, account, key, messCount) {
    var VIEW_COUNT_MESS = 3;
    
    var textAllMess = '';

    var countAllMess = messCount;
    textAllMess = countAllMess + ' пис' + getTextAllMess(countAllMess);

    var accountHtml = '<ul class="account" id="account_' + key + '">'
    + ' <li class="createmess"></li>'
    + ' <li class="account_name">' + account + '</li>';
    if (countAllMess > 0) {
        accountHtml += ' <li class="all_mess">' + textAllMess + '</li>'
    } else {
        accountHtml += ' <li class="all_mess"></li>'
    }
    
    accountHtml += '</ul>'
        + '<div class="messages" id="messages_' + key + '"></div>';
                
    document.getElementById('content').insertAdjacentHTML('beforeEnd', accountHtml);
    document.getElementById('content').style.display = 'block';

    var user = backgroundPage.app.account.users[account];
    var viewCountMess = VIEW_COUNT_MESS;
    if (mess != null && mess.length != 0) {
        for (var i = 0; i < mess.length; i++) {

            if (i == viewCountMess) {
                break;
            }

            if (user.excludeFolder.length > 0) {
                if (!!~user.excludeFolder.indexOf(mess[i].folder)) {
                    viewCountMess++;
                    continue;
                }
            }
            
            if (user.userExcludeFolder.length > 0) {
                if (!!~user.userExcludeFolder.indexOf(mess[i].folder)) {
                    viewCountMess++;
                    continue;
                }
            }

            var subject = mess[i].subject.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
            var subject = subject == '' ? 'Без темы' : subject;
            var snippet = mess[i].snippet.replace(/&amp;/g, "&").replace(/&quot;/g, '"');

            var messHTML = '<div class="mes" data-mess="' + mess[i].id + '" data-user="' + account + '">';

            messHTML += '<div id="action">'
                + '<div class="mes_status_icon"><i title="Пометить флажком"></i></div>'
            + '</div>';
            if(JSON.parse(localStorage["view_photo"])) {
                //messHTML += '<span class="messageline__body__avatar__pic" style="background-image:url(' + mess[i].correspondents.from[0].avatars['50x50'] + ');"></span>';
                messHTML += '<span class="messageline__body__avatar__pic" style="background-image:url(http://filin.mail.ru/pic?width=32&height=32&email=' + mess[i].correspondents.from[0].email + ');"></span>';
            }

            var attachmentElem = '';

            if (mess[i].flags.attach) {
                attachmentElem = '<img id="attachment" src="img/countersign.png" width="17" height="15"/>';
            }

            messHTML += ' <div id="from">'
                + '    <a>' + getFromName(mess[i]) +'</a>'
                + '    <div class="sub_info">'
                +           attachmentElem
                + '         <span id="date">'+shortTime(mess[i].date)+'</span>'
                + '     </div>'
                + ' </div>';

            messHTML += ' <div id="subject">'
                + '     <a>'+subject+'</a>'
                + '     <div class="subject_fade">&nbsp;</div>'
                + ' </div>';

            messHTML += '</div>';

            document.getElementById('messages_' + key).insertAdjacentHTML('beforeEnd', messHTML);
        }
    } else {
        var mess = '<div class="go_email">Непрочитанных ' + textAllMess + '</div>';
        document.getElementById('messages_' + key).insertAdjacentHTML('beforeEnd', mess);
    }
}

function notAuth() {
    var authBox = document.createElement('div');
    authBox.id = "not_auth";

    authBox.innerHTML = 'Необходимо авторизоваться';
    authBox.addEventListener('click', function() {
        backgroundPage.openTab.goToLogin();
        window.close();
        return false;
    });
    
    document.getElementById('content').appendChild(authBox);
    document.getElementById('content').style.display = 'block';
}

function addEvent(account, key) {
    var box = document.getElementById('account_' + key);
    
    box.getElementsByClassName('createmess')[0].addEventListener('click', function() {
        backgroundPage.openTab.createNewMess(account);
        window.close();
        return false;
    });
    
    box.getElementsByClassName('account_name')[0].addEventListener('click', function() {
        backgroundPage.openTab.goToInbox(account);
        window.close();
        return false;
    });
    
    if (box.getElementsByClassName('all_mess').length != 0) {
        box.getElementsByClassName('all_mess')[0].addEventListener('click', function() {
            backgroundPage.openTab.goToAllUnread(account);
            window.close();
            return false;
        });
    }
    
    if (box.nextSibling.getElementsByClassName('go_email').length != 0) {
        box.nextSibling.getElementsByClassName('go_email')[0].addEventListener('click', function() {
            backgroundPage.openTab.goToInbox(account);
            window.close();
            return false;
        });
    }
    
    var mess = box.nextSibling.getElementsByClassName('mes');
    for(var i = 0; i < mess.length; i++) {
        mess[i].addEventListener('click', function() {
            var id = this.getAttribute('data-mess');
            var email = this.getAttribute('data-user');
            backgroundPage.openTab.openNewMess(id, email);
            window.close();
            return false;
        });
    }
    
}

function loadingView() {
    var elem = document.getElementsByClassName('update')[0];
    var rotate = elem.style.webkitTransform.match(/[0-9]+/g) || 0;
    
    if(typeof rotate == 'object') {
        rotate = rotate[0] * 1;
    }
    
    
    rotate = rotate + 2;
    elem.style.webkitTransform = 'rotate(' + rotate + 'deg)'
    
    if(rotate != 360) {
        setTimeout(loadingView, 5);
    } else {
        elem.style.webkitTransform = 'rotate(' + 0 + 'deg)'
    }
}

document.addEventListener('DOMContentLoaded', function () {
    init();
});
