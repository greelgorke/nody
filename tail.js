var stream = require('stream')
var CONST = require('./constants')

function Tail( fallThroughHandler ){
  if( ! (this instanceof Tail) ) return new Tail( fallThroughHandler )
  stream.Writable.call( this, {objectMode: true} )
  this.fallThroughHandler = fallThroughHandler || function(){}
}
require('util').inherits( Tail, stream.Writable )

Tail.prototype._write = function ( item, encoding, callback ) {

  if ( item.handled === false ) {
    this.fallThroughHandler( new Error('Pipeitem not handled.') , item.context )
  }

  callback()
}

module.exports = function( fallThroughHandler ){
  return new Tail( fallThroughHandler )
}