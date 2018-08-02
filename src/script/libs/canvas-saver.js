const JSZip = require( 'jszip' );

let CanvasSaver = class {
  constructor( canvas ) {
    this.canvas = canvas;

    this.inProgress = 0;
    this.queueDL = false;
    this.zip = new JSZip();
    this.anchor = document.createElement( 'a' );
  }

  add( frame ) {
    let filename = ( '0000' + frame ).slice( -5 ) + '.png';
    this.inProgress ++;

    this.canvas.toBlob( ( blob ) => {
      this.zip.file( filename, blob );
      this.inProgress --;
      this.__done();
    } );
  }

  download() {
    this.queueDL = true;
    this.__done();
  }

  __done() {
    if ( this.queueDL && this.inProgress === 0 ) {
      this.queueDL = false;
      this.zip.generateAsync( { type: 'blob' } ).then( ( blob ) => {
        this.anchor.href = window.URL.createObjectURL( blob );
        this.anchor.download = 'canvasSaver-' + Date.now();
        this.anchor.click();
      } );
    }
  }
};

module.exports = CanvasSaver;