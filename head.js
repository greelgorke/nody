var stream = require('stream')
var piped = require('./piped')
var CONST = require('./constants')
var slice = Array.prototype.slice


function Head(){
  if( ! (this instanceof Head) ) return new Head()
  stream.Transform.call( this, { objectMode: true } )
}

require('util').inherits( Head, stream.Transform )

Head.prototype._transform = function( item, ignore, callback ) {
  this.push( item )
  callback()
};

Head.prototype._protoWrite = Head.prototype.write

Head.prototype.write = function() {
  this._protoWrite( piped.apply( null, arguments ) )
}

Head.prototype.asCallback = function() {
  var self = this
  return function(err) {
    if( err ) {
      return self.emit( 'error', err )
    }
    var args = slice.apply(arguments, 0, 1)
    self.write.apply( self, args )
    self.end()
  }
}

Head.prototype.asEventListener = function() {
  var self = this
  return function() {
    var args = slice.apply( arguments )
    self.write.apply( self, args )
  }
}

module.exports = function(){
  return new Head()
}