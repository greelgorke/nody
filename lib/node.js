var stream = require('stream')
var piping = require('./piping')


var _slice = Array.prototype.slice

function Node( processor ){
  if( ! ( this instanceof Node ) ) return new Node( processor )
  stream.Transform.call( this, { objectMode: true } )
  this.processor = processor

  if ( typeof this.processor !== 'function' )
    throw new Error("No processor function provided to a Node instance")

}
require('util').inherits( Node, stream.Transform )

piping( Node.prototype )

Node.prototype._transform = function( item, encoding, callback ) {

  var self = this
  var ctx = _slice.call(item.payload)

  ctx.push( done )

  this.processor.apply( null, ctx )

  function done ( err ) {
    if ( err ){
      return callback( err )
    }

    if (arguments.length > 1){
      item.applyPayload( _slice.call(arguments, 1) )

    }

    self.push( item )
    return callback()
  }
}


module.exports = function node( processor ) {
  return new Node( processor )
}
