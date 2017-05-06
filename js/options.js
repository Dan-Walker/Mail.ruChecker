var backgroundPage = chrome.extension.getBackgroundPage();
var users = backgroundPage.app.account.users;

var oldPro = false;
var soundNotif = null;
var time = null;
var interfacePage = null;
var foldersUser = [];

document.addEventListener('DOMContentLoaded', function () {
    init();
    viewFolderUser();
});
            
function init() {
    soundInit();
    timeInit();
    interfaceInit();

    if(JSON.parse(localStorage["modal_views"])) {
        document.getElementById("modal_views0").checked = true;
    } else {
        document.getElementById("modal_views1").checked = true;
    }
                
    document.getElementById("view_notif").checked = JSON.parse(localStorage["view_notif"]);
    document.getElementById("view_photo").checked = JSON.parse(localStorage["view_photo"]);
    document.getElementById('save').addEventListener('click', save);

    document.getElementById("modal_views0").addEventListener('change', function () { save(false); });
    document.getElementById("modal_views1").addEventListener('change', function () { save(false); });
    document.getElementById("view_notif").addEventListener('change', function () { save(false); });
    document.getElementById("view_photo").addEventListener('change', function () { save(false); });
}

function soundInit() {
    soundNotif = document.getElementById('sound_notif');
    var soundNotifText = document.getElementById('sound_notif_text');
    var flagSelect = false;
    for(var i = 0; i < soundNotif.options.length; i++) {
        if(soundNotif.options[i].value == localStorage["soundtrek"]) {
            flagSelect = true;
            soundNotif.options[i].selected = true;
            soundNotifText.innerHTML = soundNotif.options[i].innerHTML;
        }
    }

    if (!flagSelect) {
        soundNotif.options[0].selected = true;
        soundNotifText.innerHTML = soundNotif.options[0].innerHTML;
    }
                
    soundNotif.onchange = function () {
        var selectedIndex = event.target.options['selectedIndex'];
        soundNotifText.innerHTML = soundNotif.options[selectedIndex].innerHTML;
        if(event.target.value != 0) {
            play(event.target.value);
        }
        save(false);
    }
}
function timeInit() {
    time = document.getElementById('time');
    var timeText = document.getElementById('time_text');
                
    for(var i = 0; i < time.options.length; i++) {
        if(time.options[i].value == localStorage["timetest"]) {
            time.options[i].selected = true;
            timeText.innerHTML = time.options[i].innerHTML;
        }
    }
                
    time.onchange = function () {
        var selectedIndex = event.target.options['selectedIndex'];
        timeText.innerHTML = time.options[selectedIndex].innerHTML;
        save(false);
    }
}

function interfaceInit() {
    interfacePage = document.getElementById('interface');
    var interfaceText = document.getElementById('interface_text');
                
    for(var i = 0; i < interfacePage.options.length; i++) {
        if(interfacePage.options[i].value == localStorage["interface"]) {
            interfacePage.options[i].selected = true;
            interfaceText.innerHTML = interfacePage.options[i].innerHTML;
        }
    }
                
    interfacePage.onchange = function () {
        var selectedIndex = event.target.options['selectedIndex'];
        interfaceText.innerHTML = interfacePage.options[selectedIndex].innerHTML;
        save(false);
    }
}

function save(mess) {
    mess = mess == undefined ? true : mess;           
    localStorage["interface"] = interfacePage.value;
    localStorage["soundtrek"] = soundNotif.value;	
    localStorage["timetest"] = time.value;
                        
    localStorage["view_notif"] = document.getElementById("view_notif").checked;
    localStorage["modal_views"] = document.getElementById("modal_views0").checked ? true : false;
    localStorage["view_photo"] = document.getElementById("view_photo").checked;
      
    for(var key in users) {
        if(!users[key].error) {
           var folderId = document.getElementById(users[key].guid).getElementsByClassName('js-input')[0].value;
           var checkFolders = [];
           
           if(folderId.length == 0) {
               folderId = [];
           } else {
               folderId = folderId.split(',');
           }
           
           folderId = folderId.map(function(item) {
                   return item;
           });
           
           backgroundPage.app.account.users[key].setUserExcludeFolder(folderId);
           backgroundPage.app.account.users[key].countUnreadMess();
        }
    }
    backgroundPage.openTab.switchIcoAction();
    if (mess) {
        shownMess();
    }
    //backgroundPage.getinfo.updateNumber();
}

function folderChec() {
    var elemFolders = document.getElementsByName('folder');
    var elemId = event.target.id.split('__');
    if(elemId[1] == 'all' && event.target.checked){
        for(var i = 0; i < elemFolders.length; i++){
            if(elemFolders[i].id != elemId[0] + '__all'
                && elemFolders[i].id.split('__')[0] == elemId[0]){
                elemFolders[i].checked = false;
            }
        }
    } else if(elemId[1] != 'all' && event.target.checked) {
        document.getElementById(elemId[0] + '__all').checked = false;
    }
}
            
function viewFolderUser() {
    if(users) {
        var flagAuth = false;

        for(var key in users) {
            if(users[key].status) {
                flagAuth = true;
                new folder(users[key]);
            }
        }

        if(!flagAuth) {
            notAuth();
        }
    } else {
        notAuth();
    }
}

function notAuth() {
    var authBox = document.createElement('div');
    authBox.id = "not_auth";
    var authLink = document.createElement('a');
    authLink.innerHTML = 'Необходимо авторизоваться';
    authLink.addEventListener('click', function() {
        backgroundPage.openTab.goToLogin();
        return false;
    });
        
    authBox.appendChild(authLink);
    document.getElementById('folder').appendChild(authBox);
}

function folder(user) {
    this.key = user.guid;
    this.user = user;
    this.hideTimeout = null;
    this.link = null;
    this.menu = null;
    this.input = null;
    this.text = null;
    this.userFolders = document.getElementById('folder');
    this.init();
    this.addEvent();
}

folder.prototype.init = function () {
    var foldersHtml = ''
        + ' <div class="form__row form__row_msg-list">'
        + '     <div class="form__row__label">'
        + '         <label for="MessagesPerPage">' + this.user.email + '</label>'
        + '     </div>'
        + '     <div class="form__row__widget">'
        + '        <div id="' + this.key + '" class="form__select form__select_custom-dropdown form__row__subwidget_inline form__row__shift form__row__shift_inline js-apply-container" >'
        + '             <div class="form__select filters__folders-dropdown js-checked-dropdown">'
        + '                 <div class="js-link" id="select_folder-link">'
        + '                     <div class="form__select__box"><div class="form__select__box__text js-text" id="mailru-webagent-gen-42">Все папки</div></div>'
        + '                     <i class="form__select__arrow"></i>'
        + '                 </div>'
        + '                 <input type="hidden" name="ApplyFolders" class="js-input" id="select_folder-input" value="">'
        + '                 <div class="form__dropdown__list filters__dropdown__menu js-menu" id="select_folder-list" style="display: none; width: 200px;">'
        + '                     <div class="dropdown__list__scroll dropdown__list__scroll-without-border">';

    var idFoldersNotChecked = [];
    var excludeFolder = this.user.excludeFolder;
    var userExcludeFolder = this.user.userExcludeFolder;

    for (var keyF in this.user.folders) {
        var id = this.user.folders[keyF].id;
        this.user.folders[keyF].name = this.conversionText(this.user.folders[keyF].name);

        if (!~excludeFolder.indexOf(id)) {
            var child = '';
            var checked = 'form__checkbox_flat_checked';
            
            if(this.user.folders[keyF].parent != '-1') {
                child = 'filters__dropdown__shift';
            }
            
            if(!!~userExcludeFolder.indexOf(id)) {
                checked = '';
                idFoldersNotChecked.push(id);
            }
            
            foldersHtml += '' 
                + '                  <label class="form__dropdown__item form__checkbox form__checkbox_flat js-dropdown-item ' + checked + '">'
                + '                      <input type="checkbox" class="form__checkbox__checkbox" value="' + this.user.folders[keyF].id + '">'
                + '                      <i class="form__checkbox__icon icon icon_form icon_form_checkmark"></i>'
                + '                      <span class="form__checkbox__label ' + child + '">' + this.user.folders[keyF].name + '</span>'
                + '                  </label>';
        }
    }

    foldersHtml += ''
        + '                     </div>'
        + '                 </div>'
        + '             </div>'
        + '         </div>'
        + '     </div>';
        + ' </div>';
    
    this.userFolders.insertAdjacentHTML('beforeEnd', foldersHtml);
    
    this.link = document.getElementById(this.key).getElementsByClassName('js-link')[0];
    this.menu = document.getElementById(this.key).getElementsByClassName('js-menu')[0];
    this.input = document.getElementById(this.key).getElementsByClassName('js-input')[0];
    this.text = document.getElementById(this.key).getElementsByClassName('js-text')[0];
    
    this.input.value = idFoldersNotChecked.join(',')
    this.viewNameFolder();
};

folder.prototype.conversionText = function(text) {
    var elem = document.createElement('div');
    elem.innerText = text;
    return elem.innerHTML;
};

folder.prototype.addEvent = function () {
    var that = this;
    this.link.onclick = function() {
        that.switchFoldersMenu();
        event.stopPropagation();
    }
    
    this.menu.onclick = function (){
        var elem = null;
        var idFolders = [];

        if(that.input.value != '') {
            idFolders = that.input.value.split(',');
        }

        if(event.target.tagName != 'INPUT') {
            if(event.target.tagName == 'LABEL') {
                elem = event.target;
            } else {
                elem = event.target.parentNode;
            }

            elem.toggleClass('form__checkbox_flat_checked');

            var idSelectFolde = elem.children[0].value;
            var index = idFolders.indexOf(idSelectFolde);

            if(index == -1) {
                idFolders.push(idSelectFolde);

            } else {
                idFolders.splice(index, 1)[0];
            }

            that.input.value = idFolders.join(',');
            that.viewNameFolder();

        }

        event.stopPropagation();
        save(false);
    }
}

folder.prototype.switchFoldersMenu = function() {
    var that = this;
    var flag = this.menu.style.display == 'none' ? true : false;
    
    this.menu.style.display = flag ? 'block' : 'none';
    this.menu.style.zIndex = 10;
    
    if(flag) {
        window.onclick = function () {
            that.switchFoldersMenu();
        }
            
        var f = function () {
            if(event.type == 'mouseout') {
                that.hideTimeout = setTimeout(function () {
                    that.switchFoldersMenu();
                }, 500);
            } else {
                clearTimeout(that.hideTimeout);
            }
        }
            
        this.link.onmouseout = f;
        this.link.onmouseover = f;
        
        this.menu.onmouseout = f;
        this.menu.onmouseover = f;
        
    } else {
        window.onclick = null;
        clearTimeout(this.hideTimeout);
        
        this.link.onmouseout = null;
        this.link.onmouseover = null;
        
        this.menu.onmouseout = null;
        this.menu.onmouseover = null;
    }
}

folder.prototype.viewNameFolder = function() {
    var idFolders = null;
    var text = 'Все папки';
        
    if(this.input.value != '') {
        idFolders = this.input.value.split(',');
        text = 'Не проверять';
        var excludeFolder = this.user.excludeFolder;
        var folderName = [];

        var folder = this.user.folders.filter(function (item){
            if(!!~idFolders.indexOf(item.id) || !!~excludeFolder.indexOf(item.id)) {
                return false;
            }
            return true;
        });
        
        for(var i = 0; i < folder.length; i++) {
            folderName.push(folder[i].name);
        }
        
        if(folderName.length != 0) {
            text = folderName.join(', ');
        }        
    }
    
    this.text.innerHTML = text;
}

function shownMess(){
    document.getElementById('options_mess').style.display = 'block';
    document.getElementById('options_mess').style.opacity = 1;
    setTimeout(hideMess, 500);
}
            
function hideMess() {
    if(document.getElementById('options_mess').style.opacity > 0.01){
        document.getElementById('options_mess').style.opacity = document.getElementById('options_mess').style.opacity - 0.002
        setTimeout(hideMess, 1);
    }
}
            
function play(treks) {
    document.getElementById('sound').src = 'sound/'+treks;
    document.getElementById('sound').play();
}