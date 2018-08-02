#define PI 3.14159265
#define TAU 6.28318531
#define saturate(i) clamp(i,0.,1.)

// ------

#extension GL_EXT_draw_buffers : require
precision highp float;

varying vec3 vPos;
varying vec3 vNor;
varying vec3 vCol;
varying float vLife;
varying float vIsOkayToDraw;

uniform vec3 cameraPos;
uniform float cameraNear;
uniform float cameraFar;
uniform vec3 lightPos;

uniform float mtlNor;
uniform float mtlWarn;

// ------

vec3 catColor( float _p ) {
  return 0.5 + 0.5 * vec3(
    cos( _p ),
    cos( _p + PI / 3.0 * 2.0 ),
    cos( _p + PI / 3.0 * 4.0 )
  );
}

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

// ------

void main() {
  if ( vIsOkayToDraw < 0.5 ) { discard; }
  if ( vLife == 0.0 ) { discard; }

  vec3 lightDir = normalize( vPos - lightPos );
  vec3 rayDir = normalize( vPos - cameraPos );
  float dif = mix( 1.0, dot( -vNor, lightDir ), 0.4 );
  vec3 col = 4.0 * dif * vCol;

  col = mix( col, 0.4 * vNor, mtlNor );

  vec3 colWarn = vec3( 8.0, 0.7, 0.02 ) * dif * step( 0.0, sin( vLife * PI * 8.0 ) );
  col = mix( col, colWarn, mtlWarn );

  gl_FragData[ 0 ] = vec4( col, 1.0 );
  gl_FragData[ 1 ] = vec4( length( cameraPos - vPos ), 0.0, 0.0, 1.0 );
}