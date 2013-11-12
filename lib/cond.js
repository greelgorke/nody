var Transform = require('stream').Transform

var piping = require('./piping')

function Cond(){
  if( ! ( this instanceof Cond ) ) return new Cond()
  Transform.call( this, {objectMode: true} )
  this._matchers = []
  this._matchingStreams = []
}
require('util').inherits( Cond, Transform )

piping(Cond.prototype)

Cond.prototype._transform = function _transform( item, encoding, callback ){
  var args = item.payload.slice()
  var matchers = this._matchers
  var matchingStreams = this._matchingStreams
  var matchingIndex = -1
  var self = this

  var iter, invoke

  //check matchers
  iter = function iter(doesMatch){
    var m = null

    if ( doesMatch === true ) {
      //if match found call, write to it

      matchingStreams[matchingIndex].write( item )
      return callback()
    }

    matchingIndex += 1

    m = matchers[matchingIndex]
    if ( typeof m === 'function' ) {

      m.apply( null, args )
    } else {

      //else pass through
      self.push(item)
      return callback()
    }
  }

  args.push( iter );

  iter()

}

Cond.prototype._protoPipe = Cond.prototype.pipe

Cond.prototype.pipe = function(matcher, matchingStream) {

  if ( typeof matcher === 'function' && matchingStream != null ) { // our api
    this._matchers.push( matcher )
    this._matchingStreams.push( matchingStream )
    return matchingStream
  } else if ( matchingStream == null && matcher != null ) { // core api
    return this._protoPipe( matcher )
  }
}

module.exports = function cond(){
  return new Cond()
}