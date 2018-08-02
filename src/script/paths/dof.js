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
  const auto = automaton.auto;

  // ------

  let vboQuad = glCat.createVertexbuffer( UltraCat.triangleStripQuad );

  // ------

  glCatPath.add( {
    dof: {
      width: width,
      height: height,
      vert: glslify( '../shaders/quad.vert' ),
      frag: glslify( '../shaders/dof.frag' ),
      blend: [ gl.ONE, gl.ONE ],
      clear: [ 0.0, 0.0, 0.0, 0.0 ],
      framebuffer: true,
      float: true,
      func: ( path, params ) => {
        glCat.attribute( 'p', vboQuad, 2 );
        glCat.uniformTexture( 'samplerColor', params.color, 0 );
        glCat.uniformTexture( 'samplerDepth', params.depth, 1 );

        glCat.uniform1f( 'bokehAmp', auto( 'bokeh/amp' ) );
        glCat.uniform1f( 'bokehFocus', auto( 'bokeh/focus' ) );
        glCat.uniform1f( 'fogAmp', auto( 'fog/amp' ) );

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    },
  } );
};