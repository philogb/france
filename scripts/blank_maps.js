var webpage = require('webpage');
var fs = require('fs');

var names = ['departements'];//, 'departements-small', 'communes', 'communes-small'];
var all = names.length;

(function raster(i) {
  var idx = names[i];
  if (!idx) {
    phantom.exit();
  } else {
    var page = webpage.create();
    page.viewportSize = ~idx.indexOf('small') ? { width: 1000, height: 900 } : { width: 3000, height : 2700 };
    page.open('http://localhost/dev/france/data/svg/' + idx + '.html', function () {
      //1.- render blank image with boundaries
      page.render('img/' + idx + '.png');
      page.release();
      raster(i + 1);
    });
  }
}(0));



