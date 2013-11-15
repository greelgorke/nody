var Transform = require('stream').Transform
var utils = require('./utils')


function Merge( merger, mergeCount, shouldMergeCheck ){
  if( ! ( this instanceof Merge ) ) return new Merge( merger )
  Transform.call( this, {objectMode:true} )

  if ( typeof merger !== 'function' ) throw new TypeError('merger should be a function(arrayOfPayloads)')

  this.merger = merger
  this.cache = Object.create(null)
  this.mergeCount = mergeCount
  this.shouldMergeCheck = shouldMergeCheck
  var self = this

  if ( this.mergeCount == null ) {
    this.mergeCount = 0

    this.on('pipe', function(){
      self.mergeCount += 1
    })

    this.on('unpipe', function(){
      self.mergeCount -= 1
    })
  }

  if ( typeof this.shouldMergeCheck !== 'function' ) {
    this.shouldMergeCheck = waitForAll
  }

  this.threshholdValue = null
}

require('util').inherits( Merge, Transform )

require('./piping')(Merge.prototype)

Merge.prototype._transform = function _transform( item, encoding, callback ){
  var self = this
  var currentCache = this.cache[ item.id ]

  if ( currentCache === null ) {
    return callback()
  } else if ( currentCache === undefined ) {
    this.cache[ item.id ] = currentCache = [ item.payload ]
    checkThreshhold(this)
  }else {
    currentCache.push( item.payload )
  }

  if ( this.shouldMergeCheck( currentCache, this.mergeCount) !== true ) {
    return callback()
  }

  utils.asyncReduce( currentCache, this.merger, function reduceCallback( err, result ) {
    if ( err ) {
      return callback(err)
    }

    item.applyPayload(result)
    self.push(item)
    self.cache[item.id] = null
    return callback()
  })
}

Merge.prototype.onThreshhold = function onThreshhold( threshholdValue, listener ) {
  this.threshholdValue = threshholdValue

  this.on( 'threshhold', listener )
  return this
}

function checkThreshhold( merge ){
  if (merge.threshholdValue > 0) {
    var filteredCache = Object.keys( merge )
                          .map( function(key){
                                  if ( merge.cache[key] != null ) return merge.cache[key]
                                }
                              )
    if ( filteredCache.length > merge.threshholdValue ) {
      merge.emit('threshhold', require('util').inspect(filteredCache) )
    }
  }
}

// MERGE_CHECKER

function waitForAll( arr, mergeCount ){
  return arr.length >= mergeCount
}

function mergeASAP( arr, mergeCount ){
  return arr.length > 0
}

// MERGE_STRATEGIES

function firstWins (arr1, arr2, cb) {
  cb( null, arr1 )
}

function lastWins (arr1, arr2, cb) {
  cb( null, arr2 || arr1 )
}

module.exports = function merge (mergerFunc, mergeCount, shouldMergeCheck) {
  return new Merge(mergerFunc, mergeCount, shouldMergeCheck)
}

module.exports.takeFirstMerge = function takeFirstMerge(){
  return new Merge( firstWins, 1, mergeASAP )
}

module.exports.takeLastMerge = function takeLastMerge(){
  return new Merge( lastWins, null, waitForAll )
}

module.exports.checkers = { waitForAll  : waitForAll
                          , mergeASAP   : mergeASAP
                          }