var stream = require('stream')
var piping = require('./piping')


var _slice = Array.prototype.slice

function Nody( processor ){
  if( ! ( this instanceof Nody ) ) return new Nody( processor )
  stream.Transform.call( this, { objectMode: true } )
  this.processor = processor

  if ( typeof this.processor !== 'function' )
    throw new Error("No processor function provided to a Nody instance")

}
require('util').inherits( Nody, stream.Transform )

piping( Nody.prototype )

Nody.prototype._transform = function( item, encoding, callback ) {

  var self = this
  var ctx = _slice.call(item)

  ctx.push( done )

  this.processor.apply( null, ctx )

  /**
   * # done conditions
   * * 1. Error appeared
   * * 2. callback is called with a ready flag
   *
   * in both cases the piped item will be considered as handled.
   * further, if the replacement is passed to the callback, it will be used as new context.
   * replacement should be an array
   *
   */
  function done ( err ) {
    var toPush = item
    if ( err ){
      return callback( err )
    }

    if (arguments.length > 1){
      toPush = _slice.call(arguments, 1)
    }

    self.push( toPush )
    return callback()
  }
}


module.exports = function nody( processor ) {
  return new Nody( processor )
}
