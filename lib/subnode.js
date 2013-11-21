var Duplex = require('stream').Duplex
var piping = require('./piping')

var _slice = Array.prototype.slice


function Subnode( consumer, producers ){
  if( ! ( this instanceof Subnode ) ) return new Subnode( consumer, producers )
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

require('util').inherits( Subnode, Duplex )

piping(Subnode.prototype)

Subnode.prototype._read = function _read( size ){
}

Subnode.prototype._write = function _write( item, encoding, callback ){
  ( this.consumer.protoWrite || this.consumer.write ).call( this.consumer, item )
  callback()
}


module.exports = function subnode ( consumer /* , optional list of producers */) {
  var producers = _slice.call( arguments, 1 )
  return new Subnode( consumer, producers )
}