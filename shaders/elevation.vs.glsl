attribute vec3 position;
attribute vec2 texCoord1;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform vec2 translate;
uniform vec2 size;

varying vec2 vTexCoord;

void main(void) {

  vec4 pos = vec4(position, 1.);
  pos.x -= (translate.x) / (size.x * 1.2);
  pos.y += (translate.y) / (size.y * 1.4);

  gl_Position = projectionMatrix * worldMatrix * pos;
  vTexCoord = texCoord1;
}
