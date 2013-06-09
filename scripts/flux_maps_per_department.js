var webpage = require('webpage');
var fs = require('fs');

var names = JSON.parse(fs.read('data/json/departements.json'));
var map = 'departements';
var all = 1;//names.length;

(function raster(i) {
  var idx = names[i];
  if (!idx) {
    phantom.exit();
  } else {
    var page = webpage.create();

    page.viewportSize = ~idx.indexOf('small') ? { width: 1000, height: 900 } : { width: 3000, height : 2700 };
    page.open('http://localhost/dev/france/data/svg/' + map + '.html#' + idx[0], function () {

      //1.- use flow dataset to create colored map for name
      page.evaluate(function () {
        var elem = document.querySelectorAll('.departments > *'),
            depName = location.hash.slice(1),
            dep = depLinks[depName],
            ans = new Array(),
            re = /^([0-9A-Z]+)\s+(.+)/,
            dataset = window.dataset,
            pop = window.pop,
            maxOut = -Infinity,
            maxIn = Infinity,
            absoluteDiff = 0,
            total, tuple, out, inbound, diff, color, depAcum,
            colorScale = new chroma.ColorScale({
                colors: ['#67001F', '#B2182B', '#D6604D', '#F4A582', '#FDDBC7', '#F7F7F7', '#D1E5F0', '#92C5DE', '#4393C3', '#2166AC', '#053061'].reverse()
            }), id, j = 0;


        for(var i = 0, l = elem.length; i < l; ++i) {
            id = elem[i].getAttribute('id');
            id = id.match(re)[1];
            tuple = dep[id] || 0;
            total = 1 || pop[id];
            diff = tuple / total;
            maxOut = maxOut > diff ? maxOut : diff;
            maxIn = maxIn < diff ? maxIn : diff;
        }

        absoluteDiff = Math.max(maxOut, Math.abs(maxIn));

        for(var i = 0, l = elem.length, scale = 2; i < l; ++i) {
          id = elem[i].getAttribute('id');
          id = id.match(re)[1];
          tuple = dep[id] || 0;
          total = 1 || pop[id];
          elem[i].setAttribute('style', 'stroke:none;stroke-width:0;stroke-opacity:0;fill:#f7f7f7;');
          diff = tuple / absoluteDiff;
          if (diff > 0) {
              diff =   1 - Math.pow(diff - 1, scale);
          } else {
              diff = -(1 - Math.pow(diff + 1, scale));
          }
          diff = 1 - (diff + 1) / 2;
          color = colorScale.getColor(diff).hex();
          elem[i].setAttribute('style', 'stroke:none;stroke-width:0;stroke-opacity:0;fill:' + color + ';');
        }
      });
      //render picking colored image
      page.render('img/deps/links-' + idx[0] + '.png');
      page.release();
      raster(i + 1);
    });
  }
}(0));




