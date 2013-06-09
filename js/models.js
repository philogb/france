var images = {
  communes: 'img/communes.png',
  departements: 'img/departements.png',
  communesFlux: 'img/communes-flux.jpg',
  departementsFlux: 'img/departements-flux.png',
  communesColors: 'img/communes-colors.png',
  departementsColor: 'img/departements-colors.png'
};

function getModels(callback) {
  //MODELS

  //us surface
  var surface = new O3D.Plane({
    type: 'x,y',
    xlen: 1,
    ylen: 900 / 1000,
    nx: 10,
    ny: 10,
    offset: 0,
    program: 'elevation',
    textures: [images.communes,
      images.departements,
      images.communesColors,
      images.departementsColor,
      images.communesFlux,
      images.departementsFlux]
  });

  //DATASETS

  function getDivisions(callback) {
    //load dataset
    var data = {}, i = 0, N = 3;

    new Request.JSON({
      url: 'data/json/communes.json',
      onSuccess: function(json) {
        data.communes = json;
        i++;
        if (i == N) {
          callback(data);
        }
      }
    }).get();

    new Request.JSON({
      url: 'data/json/departements.json',
      onSuccess: function(json) {
        data.departements = json;
        i++;
        if (i == N) {
          callback(data);
        }
      }
    }).get();

    new Request.JSON({
      url: 'data/json/flux.json',
      onSuccess: function(json) {
        data.flow = json;
        i++;
        if (i == N) {
          callback(data);
        }
      }
    }).get();
  }

  //get data and create models.
  getDivisions(function(data) {
    var models = {
      map: surface
    };
    callback.onComplete(data, models);
  });
}
