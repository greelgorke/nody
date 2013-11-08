module.exports = function pipeable ( nd ) {
  var protoPipe = nd.pipe


  if ( typeof protoPipe !== 'function')
    throw new TypeError('piping candidate should have pipe function!')

  function pipe ( s ) {
    var targetInObjMode = ( s._writableState.objectMode === true )
    if ( ! targetInObjMode )
      throw new Error("Stream to pipe to must be in objectMode. If you want non-objectMode, use adapter")
    return protoPipe.apply( this, arguments )
  }

  nd.pipe = pipe

}
