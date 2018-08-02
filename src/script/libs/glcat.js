let GLCat = class {
  constructor( _gl ) {
    let it = this;

    it.gl = _gl;
    let gl = it.gl;

    gl.enable( gl.DEPTH_TEST );
    gl.depthFunc( gl.LEQUAL );
    gl.enable( gl.BLEND );
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

    it.extensions = {};

    it.currentProgram = null;
  }

  getExtension( _name, _throw ) {
    let it = this;
    let gl = it.gl;

    if ( typeof _name === 'object' && _name.isArray() ) {
      return _name.every( ( name ) => it.getExtension( name, _throw ) );
    } else if ( typeof _name === 'string' ) {
      if ( it.extensions[ _name ] ) {
        return it.extensions[ _name ];
      } else {
        it.extensions[ _name ] = gl.getExtension( _name );
        if ( it.extensions[ _name ] ) {
          return it.extensions[ _name ];
        } else {
          if ( _throw ) {
            throw console.error( 'The extension "' + _name + '" is not supported' );
          }
          return false;
        }
      }
    } else {
      throw 'GLCat.getExtension: _name must be string or array';
    }
  }

  createProgram( _vert, _frag, _onError ) {
    let it = this;
    let gl = it.gl;

    let error;
    if ( typeof _onError === 'function' ) {
      error = _onError;
    } else {
      error = ( _str ) => { console.error( _str ); };
    }

    let vert = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vert, _vert );
    gl.compileShader( vert );
    if ( !gl.getShaderParameter( vert, gl.COMPILE_STATUS ) ) {
      error( gl.getShaderInfoLog( vert ) );
      return null;
    }

    let frag = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( frag, _frag );
    gl.compileShader( frag );
    if ( !gl.getShaderParameter( frag, gl.COMPILE_STATUS ) ) {
      error( gl.getShaderInfoLog( frag ) );
      return null;
    }

    let program = gl.createProgram();
    gl.attachShader( program, vert );
    gl.attachShader( program, frag );
    gl.linkProgram( program );
    if ( gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
      program.locations = {};
      return program;
    } else {
      error( gl.getProgramInfoLog( program ) );
      return null;
    }
  }

  useProgram( _program ) {
    let it = this;
    let gl = it.gl;

    gl.useProgram( _program );
    it.currentProgram = _program;
  }

  createVertexbuffer( _array ) {
    let it = this;
    let gl = it.gl;

    let buffer = gl.createBuffer();

    if ( _array ) { it.setVertexbuffer( buffer, _array ); }

    return buffer;
  }

  setVertexbuffer( _buffer, _array, _mode ) {
    let it = this;
    let gl = it.gl;

    let mode = _mode || gl.STATIC_DRAW;

    gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( _array ), mode );
    gl.bindBuffer( gl.ARRAY_BUFFER, null );

    _buffer.length = _array.length;
  }

  createIndexbuffer( _array ) {
    let it = this;
    let gl = it.gl;

    let buffer = gl.createBuffer();

    if ( _array ) { it.setIndexbuffer( buffer, _array ); }

    return buffer;
  }

  setIndexbuffer( _buffer, _array, _mode ) {
    let it = this;
    let gl = it.gl;

    let mode = _mode || gl.STATIC_DRAW;

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, _buffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Int16Array( _array ), mode );
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

    _buffer.length = _array.length;
  }

  getAttribLocation( _name ) {
    let it = this;
    let gl = it.gl;

    let location;
    if ( it.currentProgram.locations[ _name ] ) {
      location = it.currentProgram.locations[ _name ];
    } else {
      location = gl.getAttribLocation( it.currentProgram, _name );
      it.currentProgram.locations[ _name ] = location;
    }

    return location;
  }

  attribute( _name, _buffer, _stride, _div ) {
    let it = this;
    let gl = it.gl;

    if ( _div ) {
      it.getExtension( 'ANGLE_instanced_arrays', true );
    }

    let location = it.getAttribLocation( _name );

    gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
    gl.enableVertexAttribArray( location );
    gl.vertexAttribPointer( location, _stride, gl.FLOAT, false, 0, 0 );

    let ext = it.getExtension( 'ANGLE_instanced_arrays' );
    if ( ext ) {
      let div = _div || 0;
      ext.vertexAttribDivisorANGLE( location, div );
    }

    gl.bindBuffer( gl.ARRAY_BUFFER, null );
  }

  getUniformLocation( _name ) {
    let it = this;
    let gl = it.gl;

    let location;

    if ( typeof it.currentProgram.locations[ _name ] !== 'undefined' ) {
      location = it.currentProgram.locations[ _name ];
    } else {
      location = gl.getUniformLocation( it.currentProgram, _name );
      it.currentProgram.locations[ _name ] = location;
    }

    return location;
  }

  uniform1i( _name, _value ) {
    let it = this;
    let gl = it.gl;

    let location = it.getUniformLocation( _name );
    gl.uniform1i( location, _value );
  }

  uniform1f( _name, _value ) {
    let it = this;
    let gl = it.gl;

    let location = it.getUniformLocation( _name );
    gl.uniform1f( location, _value );
  }

  uniform2fv( _name, _value ) {
    let it = this;
    let gl = it.gl;

    let location = it.getUniformLocation( _name );
    gl.uniform2fv( location, _value );
  }

  uniform3fv( _name, _value ) {
    let it = this;
    let gl = it.gl;

    let location = it.getUniformLocation( _name );
    gl.uniform3fv( location, _value );
  }

  uniform4fv( _name, _value ) {
    let it = this;
    let gl = it.gl;

    let location = it.getUniformLocation( _name );
    gl.uniform4fv( location, _value );
  }

  uniformMatrix4fv( _name, _value, _transpose ) {
    let it = this;
    let gl = it.gl;

    let location = it.getUniformLocation( _name );
    gl.uniformMatrix4fv( location, _transpose || false, _value );
  }

  uniformCubemap( _name, _texture, _number ) {
    let it = this;
    let gl = it.gl;

    let location = it.getUniformLocation( _name );
    gl.activeTexture( gl.TEXTURE0 + _number );
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, _texture );
    gl.uniform1i( location, _number );
  }

  uniformTexture( _name, _texture, _number ) {
    let it = this;
    let gl = it.gl;

    let location = it.getUniformLocation( _name );
    gl.activeTexture( gl.TEXTURE0 + _number );
    gl.bindTexture( gl.TEXTURE_2D, _texture );
    gl.uniform1i( location, _number );
  }

  createTexture() {
    let it = this;
    let gl = it.gl;

    let texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.bindTexture( gl.TEXTURE_2D, null );

    return texture;
  }

  textureFilter( _texture, _filter ) {
    let it = this;
    let gl = it.gl;

    gl.bindTexture( gl.TEXTURE_2D, _texture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, _filter );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, _filter );
    gl.bindTexture( gl.TEXTURE_2D, null );
  }

  textureWrap( _texture, _wrap ) {
    let it = this;
    let gl = it.gl;

    gl.bindTexture( gl.TEXTURE_2D, _texture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, _wrap );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, _wrap );
    gl.bindTexture( gl.TEXTURE_2D, null );
  }

  setTexture( _texture, _image ) {
    let it = this;
    let gl = it.gl;

    gl.bindTexture( gl.TEXTURE_2D, _texture );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _image );
    gl.bindTexture( gl.TEXTURE_2D, null );
  }

  setTextureFromArray( _texture, _width, _height, _array ) {
    let it = this;
    let gl = it.gl;

    gl.bindTexture( gl.TEXTURE_2D, _texture );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array( _array ) );
    gl.bindTexture( gl.TEXTURE_2D, null );
  }

  setTextureFromFloatArray( _texture, _width, _height, _array ) {
    let it = this;
    let gl = it.gl;

    it.getExtension( 'OES_texture_float', true );

    gl.bindTexture( gl.TEXTURE_2D, _texture );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, new Float32Array( _array ) );
    if ( !it.getExtension( 'OES_texture_float_linear' ) ) { it.textureFilter( _texture, gl.NEAREST ); }
    gl.bindTexture( gl.TEXTURE_2D, null );
  }

  copyTexture( _texture, _width, _height ) {
    let it = this;
    let gl = it.gl;

    gl.bindTexture( gl.TEXTURE_2D, _texture );
    gl.copyTexImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, _width, _height, 0 );
    gl.bindTexture( gl.TEXTURE_2D, null );
  }

  createCubemap( _arrayOfImage ) {
    let it = this;
    let gl = it.gl;

    // order : X+, X-, Y+, Y-, Z+, Z-
    let texture = gl.createTexture();

    gl.bindTexture( gl.TEXTURE_CUBE_MAP, texture );
    for ( let i = 0; i < 6; i ++ ) {
      gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _arrayOfImage[ i ] );
    }
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );

    return texture;
  }

  createFramebuffer( _width, _height ) {
    let it = this;
    let gl = it.gl;

    let framebuffer = {};
    framebuffer.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.framebuffer );

    framebuffer.depth = gl.createRenderbuffer();
    gl.bindRenderbuffer( gl.RENDERBUFFER, framebuffer.depth );
    gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height );
    gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, framebuffer.depth );

    framebuffer.texture = it.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, framebuffer.texture );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
    gl.bindTexture( gl.TEXTURE_2D, null );

    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0 );
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );

    return framebuffer;
  }

  resizeFramebuffer( _framebuffer, _width, _height ) {
    let it = this;
    let gl = it.gl;

    gl.bindFramebuffer( gl.FRAMEBUFFER, _framebuffer.framebuffer );

    gl.bindRenderbuffer( gl.RENDERBUFFER, _framebuffer.depth );
    gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height );
    gl.bindRenderbuffer( gl.RENDERBUFFER, null );

    gl.bindTexture( gl.TEXTURE_2D, _framebuffer.texture );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
    gl.bindTexture( gl.TEXTURE_2D, null );

    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
  }

  createFloatFramebuffer( _width, _height ) {
    let it = this;
    let gl = it.gl;

    it.getExtension( 'OES_texture_float', true );

    let framebuffer = {};
    framebuffer.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.framebuffer );

    framebuffer.depth = gl.createRenderbuffer();
    gl.bindRenderbuffer( gl.RENDERBUFFER, framebuffer.depth );
    gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height );
    gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, framebuffer.depth );

    framebuffer.texture = it.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, framebuffer.texture );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null );
    if ( !it.getExtension( 'OES_texture_float_linear' ) ) { it.textureFilter( framebuffer.texture, gl.NEAREST ); }
    gl.bindTexture( gl.TEXTURE_2D, null );

    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0 );
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );

    return framebuffer;
  }

  resizeFloatFramebuffer( _framebuffer, _width, _height ) {
    let it = this;
    let gl = it.gl;

    gl.bindFramebuffer( gl.FRAMEBUFFER, _framebuffer.framebuffer );

    gl.bindRenderbuffer( gl.RENDERBUFFER, _framebuffer.depth );
    gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height );
    gl.bindRenderbuffer( gl.RENDERBUFFER, null );

    gl.bindTexture( gl.TEXTURE_2D, _framebuffer.texture );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null );
    gl.bindTexture( gl.TEXTURE_2D, null );

    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
  }

  createDrawBuffers( _width, _height, _numDrawBuffers ) {
    let it = this;
    let gl = it.gl;

    it.getExtension( 'OES_texture_float', true );
    let ext = it.getExtension( 'WEBGL_draw_buffers', true );

    if ( ext.MAX_DRAW_BUFFERS_WEBGL < _numDrawBuffers ) {
      throw 'createDrawBuffers: MAX_DRAW_BUFFERS_WEBGL is ' + ext.MAX_DRAW_BUFFERS_WEBGL;
    }

    let framebuffer = {};
    framebuffer.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer.framebuffer );

    framebuffer.depth = gl.createRenderbuffer();
    gl.bindRenderbuffer( gl.RENDERBUFFER, framebuffer.depth );
    gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height );
    gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, framebuffer.depth );

    framebuffer.textures = [];
    for ( let i = 0; i < _numDrawBuffers; i ++ ) {
      framebuffer.textures[ i ] = it.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, framebuffer.textures[ i ] );
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null );
      if ( !it.getExtension( 'OES_texture_float_linear' ) ) { it.textureFilter( framebuffer.textures[ i ], gl.NEAREST ); }
      gl.bindTexture( gl.TEXTURE_2D, null );

      gl.framebufferTexture2D( gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL + i, gl.TEXTURE_2D, framebuffer.textures[ i ], 0 );
    }

    let status = gl.checkFramebufferStatus( gl.FRAMEBUFFER );
    if ( status !== gl.FRAMEBUFFER_COMPLETE ) {
      throw 'createDrawBuffers: gl.checkFramebufferStatus( gl.FRAMEBUFFER ) returns ' + status;
    }
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );

    return framebuffer;
  }

  resizeDrawBuffers( _framebuffer, _width, _height ) {
    let it = this;
    let gl = it.gl;

    gl.bindFramebuffer( gl.FRAMEBUFFER, _framebuffer.framebuffer );

    gl.bindRenderbuffer( gl.RENDERBUFFER, _framebuffer.depth );
    gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height );
    gl.bindRenderbuffer( gl.RENDERBUFFER, null );

    for ( let i = 0; i < _framebuffer.textures.length; i ++ ) {
      gl.bindTexture( gl.TEXTURE_2D, _framebuffer.textures[ i ] );
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null );
      gl.bindTexture( gl.TEXTURE_2D, null );
    }

    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
  }

  drawBuffers( _numDrawBuffers ) {
    let it = this;
    let gl = it.gl;

    let ext = it.getExtension( 'WEBGL_draw_buffers', true );

    let array = [];
    if ( typeof _numDrawBuffers === 'number' ) {
      for ( let i = 0; i < _numDrawBuffers; i ++ ) {
        array.push( ext.COLOR_ATTACHMENT0_WEBGL + i );
      }
    } else {
      array = array.concat( _numDrawBuffers );
    }
    ext.drawBuffersWEBGL( array );
  }

  clear( _r, _g, _b, _a, _d ) {
    let it = this;
    let gl = it.gl;

    let r = _r || 0.0;
    let g = _g || 0.0;
    let b = _b || 0.0;
    let a = typeof _a === 'number' ? _a : 1.0;
    let d = typeof _d === 'number' ? _d : 1.0;

    gl.clearColor( r, g, b, a );
    gl.clearDepth( d );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
  }
};

module.exports = GLCat;
