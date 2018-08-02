#define PARTICLE_LIFE_LENGTH 3.0

#define HUGE 9E16
#define PI 3.14159265
#define TAU 6.283185307
#define V vec3(0.,1.,-1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)/(m))*(m))
#define lofir(i,m) (floor((i)/(m)+.5)*(m))

// ------

precision highp float;

uniform float time;
uniform float progress;
uniform float automatonLength;

uniform float trails;
uniform float trailLength;
uniform float trailComputePixels;

uniform float totalFrame;
uniform bool init;
uniform float deltaTime;
uniform vec2 resolution;

uniform sampler2D samplerPcompute;
uniform sampler2D samplerRandom;

uniform float noiseScale;

// ------

vec2 vInvert( vec2 _uv ) {
  return vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * _uv;
}

// ------

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

float fractSin( float i ) {
  return fract( sin( i ) * 1846.42 );
}

vec4 random( vec2 _uv ) {
  return texture2D( samplerRandom, _uv );
}

#pragma glslify: prng = require( ./prng );
#pragma glslify: noise = require( ./simplex4d );

vec3 randomSphere( inout vec4 seed ) {
  vec3 v;
  for ( int i = 0; i < 10; i ++ ) {
    v = vec3(
      prng( seed ),
      prng( seed ),
      prng( seed )
    ) * 2.0 - 1.0;
    if ( length( v ) < 1.0 ) { break; }
  }
  return v;
}

vec2 randomCircle( inout vec4 seed ) {
  vec2 v;
  for ( int i = 0; i < 10; i ++ ) {
    v = vec2(
      prng( seed ),
      prng( seed )
    ) * 2.0 - 1.0;
    if ( length( v ) < 1.0 ) { break; }
  }
  return v;
}

vec3 randomBox( inout vec4 seed ) {
  vec3 v;
  v = vec3(
    prng( seed ),
    prng( seed ),
    prng( seed )
  ) * 2.0 - 1.0;
  return v;
}

float uneune( float i, float p ) {
  return sin( TAU * (
    fractSin( i ) + floor( 1.0 + 4.0 * fractSin( i + 54.12 ) ) * p
  ) );
}

vec3 uneune3( float i, float p ) {
  return vec3( uneune( i, p ), uneune( i + 11.87, p ), uneune( i + 21.92, p ) );
}

// ------

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 puv = vec2( ( floor( gl_FragCoord.x / trailComputePixels ) * trailComputePixels + 0.5 ) / resolution.x, uv.y );
  float mode = mod( gl_FragCoord.x, trailComputePixels );
  vec2 dpix = vec2( 1.0 ) / resolution;

  float dt = deltaTime;

  // == if it is not head of particles =========================================
  if ( trailComputePixels < gl_FragCoord.x ) {
    puv.x -= trailComputePixels / resolution.x;
    vec4 pos = texture2D( samplerPcompute, puv );
    vec4 vel = texture2D( samplerPcompute, puv + dpix * vec2( 1.0, 0.0 ) );

    pos.xy += dt;
    // pos.xy = rotate2D( length( pos.xy ) * 0.3 * dt ) * pos.xy;
    pos.w = saturate( pos.w - 1.0 / trailLength );

    gl_FragColor = (
      mode < 1.0 ? pos :
      vel
    );
    return;
  }

  // == prepare some vars for fuck around head particle ========================
  vec4 seed = texture2D( samplerRandom, puv );
  prng( seed );

  vec4 pos = texture2D( samplerPcompute, puv );
  vec4 vel = texture2D( samplerPcompute, puv + dpix * vec2( 1.0, 0.0 ) );

  float timing = mix( 0.0, PARTICLE_LIFE_LENGTH, floor( puv.y * trails ) / trails );
  timing += lofi( time, PARTICLE_LIFE_LENGTH );

  if ( time - deltaTime + PARTICLE_LIFE_LENGTH < timing ) {
    timing -= PARTICLE_LIFE_LENGTH;
  }

  // == initialize particles ===================================================
  if ( time - deltaTime < timing && timing <= time ) {
    dt = time - timing;

    pos.xyz = 4.0 * vec3( sin( PI * timing / automatonLength ), cos( PI * timing / automatonLength ), 0.0 );
    pos.yz = rotate2D( -1.0 ) * pos.yz;
    pos.xyz *= prng( seed ) < 0.5 ? 1.0 : -1.0;
    pos.xyz += 0.5 * randomSphere( seed );

    vel.xyz = 1.0 * randomSphere( seed );
    vel.w = 1.0; // jumping flag

    pos.w = 1.0; // life
  } else {
    vel.w = 0.0; // remove jumping flag
  }

  // == update particles =======================================================
  vel.xyz += 20.0 * noiseScale * vec3(
    noise( vec4( 0.4 * pos.xyz, 1.485 ) ),
    noise( vec4( 0.4 * pos.xyz, 3.485 ) ),
    noise( vec4( 0.4 * pos.xyz, 5.485 ) )
  ) * dt;
  // vel.y += 10.0 * dt;
  vel.zx += 3.0 * vec2( vel.x, -vel.z ) * dt;

  pos.xyz += vel.xyz * dt;
  pos.w -= dt / PARTICLE_LIFE_LENGTH;

  gl_FragColor = (
    mode < 1.0 ? pos :
    vel
  );
}