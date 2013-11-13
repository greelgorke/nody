var Transform = require('stream').Transform
var utils = require('./utils')


function Merge( merger){
  if( ! ( this instanceof Merge ) ) return new Merge( merger)
  Transform.call( this, {objectMode:true} )

  if ( typeof merger !== 'function' ) throw new TypeError('merger should be a function(arrayOfPayloads)')

  this.merger = merger
  this.mergeCount = 0
  this.cache = Object.create(null)
}
require('util').inherits( Merge, Transform )

Merge.prototype._transform = function _transform( item, encoding, callback ){
  var currentCache = this.cache[ item.id ]
  var self = this

  if ( currentCache == null ) {
    this.cache[ item.id ] = currentCache = [ item.payload ]
  } else {
    currentCache.push( item.payload )
  }

  if ( currentCache.length < this.mergeCount ){
    return callback()
  }

  utils.asyncReduce(currentCache, this.merger, function ( err, result ){
    if ( err ) {
      return callback(err)
    }

    item.applyPayload(result)
    self.push(item)
    return callback()
  }

}

function defaultMerger (arr1, arr2, cb) {
  arr1.map(function(elem){})
}

module.exports = function merge (mergerFunc) {
  return new Merge(mergerFunc)
}

module.exports.withDefaultMerger = function withDefaultMerger(){
  return new Merge(defaultMerger)
}