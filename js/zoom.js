(function() {
    var zoomFx = new Fx({
        duration: 1000,
        transition: Fx.Transition.Expo.easeInOut
    });

    function in(app, e, complete) {
        var x = e.x,
            y = e.y,
            program = app.program,
            camera = app.camera,
            pos = camera.position;

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
                app.settings.map = [0.2 + (0.5 - 0.2) * delta, 0.8 + (0.5 - 0.8) * delta, 0, 0, 0.6 * delta, 0.5 * (1 - delta)];
            },
            onComplete: function() {
                app.settings.mode = 1;
                program.setUniform('mode', app.settings.mode);
                app.updatePicking = true;
                app.dom.tip.style.visibility = 'visible';
                program.setUniform('commune', [-1, -1, -1, -1]);
                program.setUniform('departement', [-1, -1, -1, -1]);
            }
        });
    }
})();
