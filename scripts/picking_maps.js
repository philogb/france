var webpage = require('webpage');
var fs = require('fs');

var names = ['departements', 'departements-small', 'communes', 'communes-small'];
var all = names.length;

(function raster(i) {
  var idx = names[i];
  if (!idx) {
    phantom.exit();
  } else {
    var page = webpage.create();

    page.viewportSize = ~idx.indexOf('small') ? { width: 1000, height: 900 } : { width: 3000, height : 2700 };
    page.open('http://localhost/dev/france/data/svg/' + idx + '.html', function () {

      //1.- use color picking to generate a new image
      var regions = page.evaluate(function () {
        var deps = document.querySelectorAll('.departments > *'),
            comms = document.querySelectorAll('.communes > *'),
            elem = deps.length ? deps : comms,
            ans = Array(elem.length),
            re = /^([0-9A-Z]+)\s+(.+)/, id;

        for(var i = 0, l = elem.length; i < l; ++i) {
          var ip = i + 1,
              r = ip % 256,
              g = ((ip / 256) >> 0) % 256,
              b = ((ip / (256 * 256)) >> 0) % 256;

          elem[i].setAttribute('style', 'stroke:black;stroke-width:0.005;stroke-opacity:0;fill:rgb(' + r + ',' + g + ',' + b + ');');

          id = elem[i].getAttribute('id');
          id = id.match(re)

          ans[i] = [id[1], id[2]];
        }

        return ans;
      });

      //2.- write list of departments/communes
      fs.write('data/json/' + idx + '.json', JSON.stringify(regions), 'w');

      //3.- render picking colored image
      page.render('img/' + idx + '-colors.png');

      page.release();
      raster(i + 1);
    });
  }
}(0));



