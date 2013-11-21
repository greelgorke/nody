var Duplex = require('stream').Duplex
var piping = require('./piping')

//public
/**
 * the wrap stream, inherits from Duplex.
 * @param consumer: Writable
 * @param vararg producers: Readable
 */
module.exports = function wrap ( consumer /* , optional list of producers */) {
  var producers = _slice.call( arguments, 1 )
  return new Wrap( consumer, producers )
}


//private
var _slice = Array.prototype.slice


function Wrap( consumer, producers ){
  if( ! ( this instanceof Wrap ) ) return new Wrap( consumer, producers )
  Duplex.call( this, { objectMode: true } )

  if ( consumer == null || consumer.writable !== true )
    throw new TypeError( "consumer must be a writable stream" )

  this.consumer = consumer

  this.producers = producers || []

  this.produced = []
  var self = this

  this.producers.forEach( function( prod ) {
    prod.on( 'readable', function(){
      var produced = prod.read()
      if( produced ) {
        self.push( produced )
        self.read(0)
      }
    })
  })
}

require('util').inherits( Wrap, Duplex )

piping(Wrap.prototype)

Wrap.prototype._read = function _read( size ){
}

Wrap.prototype._write = function _write( item, encoding, callback ){
  ( this.consumer.protoWrite || this.consumer.write ).call( this.consumer, item )
  callback()
}
