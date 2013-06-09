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

      //1.- use flow dataset to create colored map
      var regions = page.evaluate(function () {
        var deps = document.querySelectorAll('.departments > *'),
            comms = document.querySelectorAll('.communes > *'),
            elem = deps.length ? deps : comms,
            ans = new Array(),
            re = /^([0-9A-Z]+)\s+(.+)/,
            dataset = window.dataset,
            pop = window.pop,
            maxOut = -Infinity,
            maxIn = -Infinity,
            maxDiff = -Infinity,
            minDiff = Infinity,
            absoluteDiff = 0,
            total, tuple, out, inbound, diff, color, depAcum,
            colorScale = new chroma.ColorScale({
                colors: ['#67001F', '#B2182B', '#D6604D', '#F4A582', '#FDDBC7', '#F7F7F7', '#D1E5F0', '#92C5DE', '#4393C3', '#2166AC', '#053061']
            }), id, j = 0;

        for(var i = 0, l = elem.length; i < l; ++i) {
            id = elem[i].getAttribute('id');
            id = id.match(re)[1];
            tuple = dataset[id];
            total = 1 || pop[id];

            if (tuple && total) {
              out = tuple[0];
              inbound = tuple[1];
              diff = (inbound - out) / total;
              maxOut = maxOut > out ? maxOut : out;
              maxIn = maxIn > inbound ? maxIn : inbound;
              maxDiff = maxDiff > diff ? maxDiff : diff;
              minDiff = minDiff < diff ? minDiff : diff;
            }
        }

        absoluteDiff = Math.max(maxDiff, Math.abs(minDiff));

        for(var i = 0, l = elem.length, scale = deps.length ? 2 : 12; i < l; ++i) {
          id = elem[i].getAttribute('id');
          id = id.match(re)[1];
          tuple = dataset[id];
          total = 1 || pop[id];
          elem[i].setAttribute('style', 'stroke:none;stroke-width:0;stroke-opacity:0;fill:#f7f7f7;');
          if (tuple) {
            diff = ((tuple[1] - tuple[0]) / total) / absoluteDiff;
            if (diff > 0) {
              diff =   1 - Math.pow(diff - 1, scale);
            } else {
              diff = -(1 - Math.pow(diff + 1, scale));
            }
            diff = 1 - (diff + 1) / 2;
            color = colorScale.getColor(diff).hex();
            ans[j++] = color;
            elem[i].setAttribute('style', 'stroke:none;stroke-width:0;stroke-opacity:0;fill:' + color + ';');
          }
        }

        return absoluteDiff;
      });
      //write list of departments/communes
      fs.write('data/json/dump' + idx + '.json', JSON.stringify(regions), 'w');
      //render picking colored image
      page.render('img/' + idx + '-flux.png');
      page.release();
      raster(i + 1);
    });
  }
}(0));



