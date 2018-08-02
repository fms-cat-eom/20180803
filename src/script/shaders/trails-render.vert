#define HUGE 9E16
#define PI 3.141592654
#define TAU 6.283185307
#define V vec3(0.,1.,-1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)/(m))*(m))
#define lofir(i,m) (floor((i+0.5)/(m))*(m))

// ------

attribute float computeU;
attribute float computeV;
attribute float triIndex;

varying vec3 vPos;
varying vec3 vNor;
varying vec3 vCol;
varying float vLife;
varying float vIsOkayToDraw;

uniform vec2 resolution;
uniform vec2 resolutionPcompute;
uniform float trailComputePixels;
uniform mat4 matP;
uniform mat4 matV;

uniform sampler2D samplerPcompute;
uniform sampler2D samplerRandom;

// ------

vec4 random( vec2 _uv ) {
  return texture2D( samplerRandom, _uv );
}

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

void main() {
  vec2 puv = vec2( computeU, computeV );
  vec2 dppix = vec2( 1.0 ) / resolutionPcompute;

  // == fetch texture ==========================================================
  vec4 pos = texture2D( samplerPcompute, puv );
  vec4 vel = texture2D( samplerPcompute, puv + dppix * vec2( 1.0, 0.0 ) );
  vec4 velp = texture2D( samplerPcompute, puv + dppix * vec2( -trailComputePixels + 1.0, 0.0 ) );

  // == assign varying variables ===============================================
  vLife = pos.w;
  vPos = pos.xyz;

  vec4 dice = random( puv.yy * 182.92 );
  vCol = dice.z < 0.7 ? vec3( 0.8, 0.2 * dice.xy ) : vec3( 0.8 );

  vIsOkayToDraw = ( velp.w < 0.5 && vel.w < 0.5 ) ? 1.0 : 0.0;

  // == compute size and direction =============================================
  float size = 0.01 + 0.1 * pow( dice.w, 2.0 );
  vec3 dir = normalize( vel.xyz );
  vec3 sid = normalize( cross( dir, vec3( 0.0, 1.0, 0.0 ) ) );
  vec3 top = normalize( cross( sid, dir ) );

  float theta = triIndex / 3.0 * TAU + vLife * 1.0;
  vec2 tri = vec2( sin( theta ), cos( theta ) );
  vNor = ( tri.x * sid + tri.y * top );
  pos.xyz += size * vNor;

  vec4 outPos = matP * matV * vec4( pos.xyz, 1.0 );
  outPos.x /= resolution.x / resolution.y;
  gl_Position = outPos;
  // gl_PointSize = resolution.y * size / outPos.z;
}