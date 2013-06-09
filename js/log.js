//Log singleton
var Log = {
    elem: null,
    timer: null,

    getElem: function() {
        if (!this.elem) {
            return (this.elem = $('log-message'));
        }
        return this.elem;
    },

    write: function(text, hide) {
        if (this.timer) {
            this.timer = clearTimeout(this.timer);
        }

        var elem = this.getElem(),
            style = elem.parentNode.style;

        elem.innerHTML = text;
        style.display = '';

        if (hide) {
            this.timer = setTimeout(function() {
                style.display = 'none';
            }, 2000);
        }
    }
};
