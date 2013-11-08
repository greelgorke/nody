var stream = require('stream')

var piped = require('./piped')
var piping = require('./piping')

var _slice = Array.prototype.slice


function Cons(){
  if( ! (this instanceof Cons) ) return new Cons()
  stream.Transform.call( this, { objectMode: true } )
  this.packed = null
}

require('util').inherits( Cons, stream.Transform )

piping( Cons.prototype )

Cons.prototype._transform = function( item, ignore, callback ) {
  this.push( item )
  callback()
};

Cons.prototype.pack = function () {
  var args = _slice.call(arguments)
  if( ! this.packed )
    this.packed = args
  else
    this.packed = this.packed.concat(args)
}

Cons.prototype.submit = function(callback) {
  if ( this.packed ) {
    this.write(this.packed, null, callback)
    this.packed = null
  }
}

module.exports = function cons(){
  return new Cons()
}