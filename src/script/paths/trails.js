// == load some modules ========================================================
const Xorshift = require( '../libs/xorshift' );
const glslify = require( 'glslify' );

// == roll the dice ============================================================
const seed = 15882356;
let xorshift = new Xorshift( seed );

// == very basic constants =====================================================
const trailComputePixels = 2;
const trailLength = 64;
const trails = 1024;

module.exports = ( context ) => {
  // == prepare context ========================================================
  const glCatPath = context.glCatPath;
  const glCat = glCatPath.glCat;
  const gl = glCat.gl;

  const automaton = context.automaton;
  const auto = automaton.auto;

  // == prepare vbos ===========================================================
  const vboQuad = glCat.createVertexbuffer( [ -1, -1, 1, -1, -1, 1, 1, 1 ] );

  const vboComputeU = glCat.createVertexbuffer( ( () => {
    let ret = [];
    for ( let i = 0; i < trailLength; i ++ ) {
      const u = ( i * trailComputePixels + 0.5 ) / ( trailLength * trailComputePixels );
      ret.push( u, u, u );
    }
    return ret;
  } )() );

  const vboTriIndex = glCat.createVertexbuffer( ( () => {
    let ret = [];
    for ( let i = 0; i < trailLength; i ++ ) {
      ret.push( 0, 1, 2 );
    }
    return ret;
  } )() );

  const ibo = glCat.createIndexbuffer( ( () => {
    let ret = [];
    for ( let i = 0; i < trailLength - 1; i ++ ) {
      for ( let j = 0; j < 3; j ++ ) {
        const jn = ( j + 1 ) % 3;
        ret.push(
          i * 3 + j, i * 3 + 3 + j, i * 3 + 3 + jn,
          i * 3 + j, i * 3 + 3 + jn, i * 3 + jn
        );
      }
    }
    return ret;
  } )() );

  const vboComputeV = glCat.createVertexbuffer( ( () => {
    let ret = [];
    for ( let i = 0; i < trails; i ++ ) {
      ret.push( ( i + 0.5 ) / trails );
    }
    return ret;
  } )() );

  // == prepare random texture =================================================
  const textureRandomSize = 32;
  const textureRandomUpdate = ( _tex ) => {
    glCat.setTextureFromArray( _tex, textureRandomSize, textureRandomSize, ( () => {
      let len = textureRandomSize * textureRandomSize * 4;
      let ret = new Uint8Array( len );
      for ( let i = 0; i < len; i ++ ) {
        ret[ i ] = Math.floor( xorshift.gen() * 256.0 );
      }
      return ret;
    } )() );
  };

  let textureRandomStatic = glCat.createTexture();
  glCat.textureWrap( textureRandomStatic, gl.REPEAT );
  textureRandomUpdate( textureRandomStatic );

  let textureRandom = glCat.createTexture();
  glCat.textureWrap( textureRandom, gl.REPEAT );

  // == let's create paths =====================================================
  glCatPath.add( {
    // == framebuffer sucks ====================================================
    trailsComputeReturn: {
      width: trailLength * trailComputePixels,
      height: trails,
      vert: glslify( '../shaders/quad.vert' ),
      frag: glslify( '../shaders/return.frag' ),
      blend: [ gl.ONE, gl.ZERO ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        glCat.attribute( 'p', vboQuad, 2 );
        glCat.uniformTexture( 'sampler0', glCatPath.fb( 'trailsCompute' ).texture, 0 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },

    // == compute trails =======================================================
    trailsCompute: {
      width: trailLength * trailComputePixels,
      height: trails,
      vert: glslify( '../shaders/quad.vert' ),
      frag: glslify( '../shaders/trails-compute.frag' ),
      blend: [ gl.ONE, gl.ZERO ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        if ( automaton.progress % 1.0 === 0.0 ) {
          xorshift.set( seed );
        }
        textureRandomUpdate( textureRandom );

        glCat.attribute( 'p', vboQuad, 2 );

        glCat.uniform1f( 'trails', trails );
        glCat.uniform1f( 'trailLength', trailLength );
        glCat.uniform1f( 'trailComputePixels', trailComputePixels );

        glCat.uniformTexture( 'samplerPcompute', glCatPath.fb( 'trailsComputeReturn' ).texture, 0 );
        glCat.uniformTexture( 'samplerRandom', textureRandom, 1 );

        glCat.uniform1f( 'noiseScale', auto( 'trail/noiseScale' ) );

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },

    // render trails ===========================================================
    trailsRender: {
      vert: glslify( '../shaders/trails-render.vert' ),
      frag: glslify( '../shaders/trails-render.frag' ),
      blend: [ gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA ],
      drawbuffers: 2,
      func: ( path, params ) => {
        glCat.attribute( 'computeU', vboComputeU, 1 );
        glCat.attribute( 'triIndex', vboTriIndex, 1 );
        glCat.attribute( 'computeV', vboComputeV, 1, 1 );

        glCat.uniform1f( 'trails', trails );
        glCat.uniform1f( 'trailLength', trailLength );
        glCat.uniform1f( 'trailComputePixels', trailComputePixels );

        glCat.uniform2fv( 'resolutionPcompute', [ trailLength * trailComputePixels, trails ] );

        glCat.uniformTexture( 'samplerPcompute', glCatPath.fb( 'trailsCompute' ).texture, 0 );
        glCat.uniformTexture( 'samplerRandom', textureRandomStatic, 1 );

        let ext = glCat.getExtension( 'ANGLE_instanced_arrays' );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, ibo );
        ext.drawElementsInstancedANGLE( gl.TRIANGLES, ibo.length, gl.UNSIGNED_SHORT, 0, trails );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
      }
    },
  } );
};