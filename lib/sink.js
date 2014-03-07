var stream = require('stream')

//public
/**
 * the sinc stream, inherits from stream.Writable
 * @param fallThroughHandler: Function [ payload ]
 */
module.exports = function sink( fallThroughHandler ){
  return new Sink( fallThroughHandler )
}

/**
 * for inheritance
 */
module.exports.Sink = Sink

//private

function Sink( fallThroughHandler ){
  if( ! (this instanceof Sink) ) return new Sink( fallThroughHandler )
  stream.Writable.call( this, {objectMode: true} )
  this.fallThroughHandler = fallThroughHandler || function(){}
}
require('util').inherits( Sink, stream.Writable )

Sink.prototype._write = function ( item, encoding, callback ) {

  this.fallThroughHandler.apply( null, item.payload )
  callback()

}
