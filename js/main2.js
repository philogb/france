/*global Asset: true, $: true, Element: true, Request: true, PhiloGL: true, Uint8Array: true, Fx: true */

PhiloGL.unpack();

window.addEvent('domready', function() {

    function initDom(app) {
        var tooltip = $('tooltip'),
            location = $('location'),
            text = $('tooltip-description'),
            fluxColor = $('flux-color'),
            panel = document.body.getElement('.panel');

        app.dom = {
            tip: tooltip,
            location: location,
            text: text,
            fluxColor: fluxColor,
            panel: panel
        };

        panel.addEvent('click', function() {
            panel.style.display = 'none';
        });
    }

    function initSettings(app) {
        var mapSettings = [0.2, 0.8, 0, 0, 0, 0.5],
            mode = 2;

        app.settings = {
            map: mapSettings,
            mode: mode
        };
    }

    var data, models;

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

    function createTooltipHTML(depName, comName) {
        var flow = data.flow,
            detail = mode == 1,
            datum = detail ? flow[comName[0]] : flow[depName[0]],
            diff = datum[0] - datum[1];

        //set the location in the title
        location.set('html', depName[1].slice(2) + (detail ? ' &raquo; ' + comName[1].trim() : ''));

        return '<ul><li>' + ['<b>Flux entrant:</b> ' + format(datum[0], 2),
                             '<b>Flux sortant:</b> ' + format(datum[1], 2),
                             '<b>Diff&eacute;rence:</b> ' +
                                 format(diff, 2)].join('</li><li>') + '</li></ul>';
    }

    //create WebGL canvas
    PhiloGL('france', {
        program: [{
            id: 'elevation',
            from: 'uris',
            path: './shaders/',
            vs: 'elevation.vs.glsl',
            fs: 'elevation.fs.glsl'
        }],
        camera: {
            aspect:  window.innerWidth / window.innerHeight,
            position: {
                x: 0, y: 0, z: 0.8
            }
        },
        textures: {
            src: ['img/communes.png',
                'img/departements.png',
                'img/communes-flux.png',
                'img/departements-flux.png',
                'img/communes-colors.png',
                'img/departements-colors.png'],
            parameters: [{
                name: 'TEXTURE_MAG_FILTER',
                value: 'LINEAR'
            }, {
                name: 'TEXTURE_MIN_FILTER',
                value: 'LINEAR'
            }, {
                name: 'TEXTURE_WRAP_S',
                value: 'CLAMP_TO_EDGE'
            }, {
                name: 'TEXTURE_WRAP_T',
                value: 'CLAMP_TO_EDGE'
            }]
        },
        events: {
            picking: false,
            centerOrigin: true,
            cachePosition: false,
            onClick: function(e) {
                var app = this,
                    camera = this.camera,
                    pos = camera.position,
                    program = this.program,
                    x = e.x,
                    y = e.y,
                    dom = app.dom,
                    settings = app.settings,
                    mode = settings.mode;

                dom.tooltip.style.visibility = 'hidden';
                if (mode == 0 || mode == 2) {
                    app.state.beforeX = x;
                    app.state.beforeY = y;

                    zoomFx.start({
                        onCompute: function(delta) {
                            program.setUniform('commune', [-1, -1, -1, -1]);
                            program.setUniform('departement', [-1, -1, -1, -1]);
                            var z = 0.8 + (0.3 - 0.8) * delta,
                                translateX = delta * x,
                                translateY = -delta * y;

                            pos.z = z;
                            camera.update();
                            program.setUniform('translate', [translateX, translateY]);
                            settings.map = [0.2 + (0.5 - 0.2) * delta, 0.8 + (0.5 - 0.8) * delta, 0, 0, 0.6 * delta, 0.5 * (1 - delta)];
                        },
                        onComplete: function() {
                            mode = 1;
                            program.setUniform('mode', mode);
                            app.state.updatePicking = true;
                            dom.tooltip.style.visibility = 'visible';
                            program.setUniform('commune', [-1, -1, -1, -1]);
                            program.setUniform('departement', [-1, -1, -1, -1]);
                        }
                    });
                } else {
                    zoomFx.start({
                        onCompute: function(delta) {
                            program.setUniform('commune', [-1, -1, -1, -1]);
                            program.setUniform('departement', [-1, -1, -1, -1]);
                            var z = 0.3 + (0.8 - 0.3) * delta,
                                translateX = (1 - delta) * app.beforeX,
                                translateY = (1 - delta) * -app.beforeY;

                            pos.z = z;
                            camera.update();
                            program.setUniform('translate', [translateX, translateY]);
                            mapSettings = [0.5 + (0.2 - 0.5) * delta, 0.5 + (0.8 - 0.5) * delta, 0, 0, 0.6 * (1 - delta), 0.5 * delta];
                        },
                        onComplete: function() {
                            mode = 2;
                            program.setUniform('translate', [0, 0]);
                            program.setUniform('mode', mode);
                            app.updatePicking = true;
                            tooltip.style.visibility = 'visible';
                            program.setUniform('commune', [-1, -1, -1, -1]);
                            program.setUniform('departement', [-1, -1, -1, -1]);
                        }
                    });
                }
            },
            onMouseMove: function(e) {
                var communes = this.communes,
                    departments = this.departements,
                    fluxCommunes = this.fluxCommunes,
                    fluxDepartements = this.fluxDepartements,
                    canvas = this.canvas,
                    program = this.program,
                    x = e.x + canvas.width / 2,
                    y = e.y + canvas.height / 2,
                    i = (x + y * canvas.width) * 4,
                    rc = communes[i],
                    gc = communes[i + 1],
                    bc = communes[i + 2],
                    ac = communes[i + 3],
                    rd = departments[i],
                    gd = departments[i + 1],
                    bd = departments[i + 2],
                    ad = departments[i + 3],
                    frc = fluxCommunes[i],
                    fgc = fluxCommunes[i + 1],
                    fbc = fluxCommunes[i + 2],
                    fac = fluxCommunes[i + 3],
                    frd = fluxDepartements[i],
                    fgd = fluxDepartements[i + 1],
                    fbd = fluxDepartements[i + 2],
                    fad = fluxDepartements[i + 3],
                    comName = communes[rc + gc * 256 + bc * 256 * 256 - 1],
                    dataDepartments = data.departements,
                    depName = dataDepartments[rd + gd * 256 + bd * 256 * 256 - 1],
                    tooltipOffset = 25;

                if (depName && comName) {
                    if (ac == 255 && ad == 255) {
                        text.set('html', createTooltipHTML(depName, comName));
                        program.setUniform('commune', [rc, gc, bc, ac]);
                        program.setUniform('departement', [rd, gd, bd, ad]);
                        tooltip.style.display = '';
                        tooltip.setPosition({
                            x: x - tooltipOffset * 2,
                            y: canvas.height - (y - tooltipOffset * 2)
                        });
                        if (mode == 1) {
                            fluxColor.style.backgroundColor = 'rgb(' + [frc, fgc, fbc].join() + ')';
                        } else {
                            fluxColor.style.backgroundColor = 'rgb(' + [frd, fgd, fbd].join() + ')';
                        }
                    }
                } else {
                    text.set('text', 'Not detected');
                    tooltip.style.display = 'none';
                    program.setUniform('commune', [-1, -1, -1, -1]);
                    program.setUniform('departement', [-1, -1, -1, -1]);
                }
            },
            onDragStart: function(e) {
                var program = this.program;
                this.pos = {
                    x: e.x,
                    y: e.y
                };
                this.updatePicking = true;
                tooltip.style.display = 'none';
                program.setUniform('commune', [-1, -1, -1, -1]);
                program.setUniform('departement', [-1, -1, -1, -1]);
                this.canvas.addClass('move');
            },
            onDragMove: function(e) {
                var z = this.camera.position.z,
                    sign = Math.abs(z) / z,
                    pos = this.pos;

                this.scene.models.forEach(function(m) {
                    m.position.y += (e.y - pos.y) / (1000 * Math.pow(3 - (mode || 2), 2));
                    m.position.x += (e.x - pos.x) / (1000 * Math.pow(3 - (mode || 2), 2));
                    m.update();
                });

                pos.x = e.x;
                pos.y = e.y;
                this.updatePicking = true;
            },
            onDragEnd: function(e) {
                var tooltipOffset = 25,
                    canvas = this.canvas,
                    x = e.x + canvas.width / 2,
                    y = e.y + canvas.height / 2;

                tooltip.style.display = '';
                tooltip.setPosition({
                    x: x - tooltipOffset * 2,
                    y: canvas.height - (y - tooltipOffset * 1.4)
                });
                this.canvas.removeClass('move');
            },
            onDragCancel: function(e) {
                var tooltipOffset = 25,
                    canvas = this.canvas,
                    x = e.x + canvas.width / 2,
                    y = e.y + canvas.height / 2;

                tooltip.style.display = '';
                tooltip.setPosition({
                    x: x - tooltipOffset * 2,
                    y: canvas.height - (y - tooltipOffset * 1.4)
                });
                this.canvas.removeClass('move');
            }
        },
        onError: function(e) {
            console.log('error', arguments);
            throw e;
        },
        onLoad: function(app) {
            //Unpack app properties
            var hour = 0,
                gl = app.gl,
                program = app.program,
                scene = app.scene,
                canvas = app.canvas,
                camera = app.camera;

            initDom(app);
            initSettings(app);
            initState(app);

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            app.communes = new Uint8Array(canvas.width * canvas.height * 4);
            app.departements = new Uint8Array(canvas.width * canvas.height * 4);

            app.fluxCommunes = new Uint8Array(canvas.width * canvas.height * 4);
            app.fluxDepartements = new Uint8Array(canvas.width * canvas.height * 4);

            program.setUniform('mode', mode);
            program.setUniform('size', [canvas.width, canvas.height]);
            program.setUniform('translate', [0, 0]);
            program.setUniform('map', mapSettings);

            app.updatePicking = true;
            app.tooltip = $('tooltip');

            Log.write('Fetching data...');

            app.setFrameBuffer('picking', {
                width: canvas.width,
                height: canvas.height,
                bindToTexture: {
                    parameters: [{
                        name: 'TEXTURE_MAG_FILTER',
                        value: 'LINEAR'
                    }, {
                        name: 'TEXTURE_MIN_FILTER',
                        value: 'LINEAR'
                    }, {
                        name: 'TEXTURE_WRAP_S',
                        value: 'CLAMP_TO_EDGE'
                    }, {
                        name: 'TEXTURE_WRAP_T',
                        value: 'CLAMP_TO_EDGE'
                    }]
                },
                bindToRenderBuffer: true
            });

            //gather data and create O3D models
            getModels({
                onProgress: function(perc) {
                    Log.write('Fetching data ' + perc + '%');
                },

                onComplete: function(dataAns, modelsAns) {
                    data = dataAns;
                    models = modelsAns;

                    //Basic gl setup
                    gl.clearColor(1.0, 1.0, 1.0, 1.0);
                    gl.disable(gl.DEPTH_TEST);
                    gl.viewport(0, 0, +canvas.width, +canvas.height);

                    scene.add(models.map);

                    draw();

                    Log.write('Done.', true);

                    //Draw the scene
                    function draw() {
                        if (app.updatePicking) {
                            app.setFrameBuffer('picking', true);
                            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            program.setUniform('map', [0, 0, 1, 0, 0, 0]);
                            scene.renderToTexture('picking');
                            gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, app.communes);

                            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            program.setUniform('map', [0, 0, 0, 1, 0, 0]);
                            scene.renderToTexture('picking');
                            gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, app.departements);

                            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            program.setUniform('map', [0, 0, 0, 0, 1, 0]);
                            scene.renderToTexture('picking');
                            gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, app.fluxCommunes);

                            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            program.setUniform('map', [0, 0, 0, 0, 0, 1]);
                            scene.renderToTexture('picking');
                            gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, app.fluxDepartements);
                            app.setFrameBuffer('picking', false);
                            app.updatePicking = false;
                        }

                        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                        program.setUniform('map', mapSettings);
                        scene.render();
                        Fx.requestAnimationFrame(draw);
                    }
                }
            });

            window.addEvent('resize', function(e) {
                var width = window.innerWidth,
                    height = window.innerHeight;

                canvas.width = width;
                canvas.height = height;
                gl.viewport(0, 0, canvas.width, canvas.height);
                app.updatePicking = true;
                app.setFrameBuffer('picking', {
                    width: width,
                    height: height
                });
                app.communes = new Uint8Array(width * height * 4);
                app.departements = new Uint8Array(width * height * 4);
                program.setUniform('size', [width, height]);
                camera.aspect = width / height;
                camera.update();
            });
        }
    });
});

