#ifdef GL_ES
precision highp float;
#endif

#define BITS 7

uniform sampler2D sampler1;
uniform sampler2D sampler2;
uniform sampler2D sampler3;
uniform sampler2D sampler4;
uniform sampler2D sampler5;
uniform sampler2D sampler6;
uniform sampler2D sampler7;

uniform float map[BITS];
uniform vec4 commune;
uniform vec4 departement;
uniform int mode;

varying vec2 vTexCoord;

void main(void) {
  vec4 communes = texture2D(sampler1, vTexCoord);
  vec4 departements = texture2D(sampler2, vTexCoord);
  vec4 communesColor = texture2D(sampler3, vTexCoord);
  vec4 departementsColor = texture2D(sampler4, vTexCoord);
  vec4 communesFlux = texture2D(sampler5, vTexCoord);
  vec4 departementsFlux = texture2D(sampler6, vTexCoord);
  vec4 linksData = texture2D(sampler7, vTexCoord);

  vec3 selected, compareWith;
  bool select = false;
  if (mode == 1) {
    selected = commune.xyz;
    compareWith = communesColor.xyz;

    selected = (selected).xyz / 255.;
    compareWith = (compareWith).xyz;

    select = commune != vec4(0);

  } else if (mode == 2) {
    selected = departement.xyz;
    compareWith = departementsColor.xyz;

    selected = (selected).xyz / 255.;
    compareWith = (compareWith).xyz;

    select = departement != vec4(0);
  }

  if (select && mode > 0 && (length(selected - compareWith) < .0001)) {
    gl_FragColor = vec4(1, 1, 0, 0.8);
  } else {
    gl_FragColor = communes * map[0] + departements * map[1] +
        communesColor * map[2] + departementsColor * map[3] +
        communesFlux * map[4] + departementsFlux * map[5] +
        linksData * map[6];
  }

}

