// お前、ナンデモアリかよ！

let UltraCat = {};

UltraCat.triangleStripQuad = [ -1, -1, 1, -1, -1, 1, 1, 1 ];
UltraCat.triangleStripQuad3 = [ -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0 ];
UltraCat.triangleStripQuadUV = [ 0, 0, 1, 0, 0, 1, 1, 1 ];

// destructive
UltraCat.shuffleArrayD = ( array, dice ) => {
  const f = dice ? dice : () => Math.random();
  for ( let i = 0; i < array.length - 1; i ++ ) {
    const ir = i + Math.floor( f() * ( array.length - i ) );
    const temp = array[ ir ];
    array[ ir ] = array[ i ];
    array[ i ] = temp;
  }
  return array;
};

UltraCat.triIndexToLineIndex = ( array ) => {
  let ret = [];
  for ( let i = 0; i < array.length / 3; i ++ ) {
    const head = i * 3;
    ret.push(
      array[ head     ], array[ head + 1 ],
      array[ head + 1 ], array[ head + 2 ],
      array[ head + 2 ], array[ head     ]
    );
  }
  return ret;
};

UltraCat.matrix2d = ( w, h ) => {
  let arr = [];
  for ( let iy = 0; iy < h; iy ++ ) {
    for ( let ix = 0; ix < w; ix ++ ) {
      arr.push( ix, iy );
    }
  }
  return arr;
};

module.exports = UltraCat;