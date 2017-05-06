Object.append = function(object) {
    for (var i = 1; i < arguments.length; i++) {
        var extension = arguments[i];
        for (var key in extension)
            if (extension.hasOwnProperty(key))
                object[key] = extension[key];
    }

    return object;
}

Object.append(Object, {
    implement: function(object, implementation) {
        var prototype = object.prototype;
        for (var key in implementation)
            if (implementation.hasOwnProperty(key) && !(key in prototype))
                prototype[key] = implementation[key];
    }
});


Object.implement(HTMLElement, {
    addClass: function(name) {
        var addons = name.split(' ').filter(function(name) {
            return !this.hasClass(name);
        }, this);

        if (addons.length)
            this.className += ' ' + addons.join(' ');
    },

    removeClass: function(name) {
        var classes = this.className.split(' ');
        if (!!~classes.indexOf(name)) {
            var index = classes.indexOf(name);
            classes.splice(index, 1)[0];
            
            this.className = classes.join(' ');
        }
    },

    hasClass: function(name) {
        var className = this.className;
        if (name instanceof RegExp)
            return name.test(className);
        return (' ' + className + ' ').indexOf(' ' + name + ' ') >= 0;
    },

    toggleClass: function(name) {
        if (this.hasClass(name))
            this.removeClass(name);
        else
            this.addClass(name);
    }
});
