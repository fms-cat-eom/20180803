const UltraCat = require( '../libs/ultracat' );
const glslify = require( 'glslify' );

// ------

module.exports = ( context ) => {
  const glCatPath = context.glCatPath;
  const glCat = glCatPath.glCat;
  const gl = glCat.gl;

  const width = context.width;
  const height = context.height;

  const automaton = context.automaton;

  // ------

  const vboQuad = glCat.createVertexbuffer( UltraCat.triangleStripQuad );

  // ------

  glCatPath.add( {
    post: {
      width: width,
      height: height,
      vert: glslify( '../shaders/quad.vert' ),
      frag: glslify( '../shaders/post.frag' ),
      blend: [ gl.ONE, gl.ZERO ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        glCat.attribute( 'p', vboQuad, 2 );
        glCat.uniformTexture( 'sampler0', params.input, 0 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },

    fxaa: {
      width: width,
      height: height,
      vert: glslify( '../shaders/quad.vert' ),
      frag: glslify( '../shaders/fxaa.frag' ),
      blend: [ gl.ONE, gl.ZERO ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        glCat.attribute( 'p', vboQuad, 2 );
        glCat.uniformTexture( 'sampler0', params.input, 0 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },
  } );
};