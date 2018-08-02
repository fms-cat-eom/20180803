#extension GL_EXT_draw_buffers : require
precision highp float;

uniform vec4 bgColor;
uniform float cameraFar;

// ------

void main() {
  gl_FragData[ 0 ] = bgColor;
  gl_FragData[ 1 ] = vec4( cameraFar, 0.0, 0.0, 1.0 );
}