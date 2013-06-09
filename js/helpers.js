(function() {
    var util = {};

    function getRGB(a, i) {
        var rd = a[i],
            gd = a[i + 1],
            bd = a[i + 2],
            ad = a[i + 3];

        return [rd, gd, bd, ad];
    }

    function format(n, decDigits, type){
        if (n != 'null' && n != 'undefined' && !isNaN(n) && n != undefined) {
            n = +n;
        }
        else {
            return '-';
        }
        var fractionDigits = 0;
        var sign = n >= 0 ? '' : '-';
        n = Math.abs(n);
        fractionDigits = decDigits || 0;
        if(n < 1){
            fractionDigits = (n < 0.1 ? 3: 2);
        }
        if(n < 1000){
            return sign + n.toFixed(fractionDigits);
        } else if(n < 1000000){
            return sign + (n/1000).toFixed(fractionDigits) + (type == 'bytes' ? ' KB' : ' K');
        } else if(n < 1000000000){
            return sign + (n/1000000).toFixed(fractionDigits) + (type == 'bytes' ? ' MB' : ' M');
        }
        else if(n < 1000000000000){
            return sign + (n/1000000000).toFixed(fractionDigits) + (type == 'bytes' ? ' GB' : ' B');
        }
        else if(n < 1000000000000000){
            return sign + (n/1000000000000).toFixed(fractionDigits) + (type == 'bytes' ? ' TB' : ' T');
        }
    }

    util.getRGB = getRGB;
    util.format = format;

    window.util = util;
})();
