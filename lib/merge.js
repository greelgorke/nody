var Transform = require('stream').Transform
var utils = require('./utils')

// public
/**
 * the merge stream
 * public methods of the stream see stream.Transform
 *     .onThreshhold( threshholdValue: Number
 *                  , threshholdListener: Function [ array of merge candidates ]
 *                  )
 *        will set the threshholdValue and add a listener for the 'threshold' event.
 * events:
 *     'threshold' emitted if a value is set and the number of unmerged payloads exceed the value
 */
module.exports = function merge (mergerFunc, shouldMergeCheck) {
  return new Merge(mergerFunc, shouldMergeCheck)
}

// convenience factory methods
module.exports.takeFirstMerge = function takeFirstMerge(){
  return new Merge( firstWins, mergeASAP )
}

module.exports.takeLastMerge = function takeLastMerge(){
  return new Merge( lastWins )
}

// convenience: some default shouldMergeCheck candidates
module.exports.checkers   = { waitForAll  : waitForAll
                            , mergeASAP   : mergeASAP
                            }

// convenience: some default mergerFunc candidates
module.exports.strategies = { firstWins  : firstWins
                            , lastWins   : lastWins
                            }

// private

function Merge( merger, shouldMergeCheck ){
  if( ! ( this instanceof Merge ) ) return new Merge( merger, shouldMergeCheck )

  Transform.call( this, {objectMode:true} )

  var self = this

  if ( typeof merger !== 'function' )
    throw new TypeError('merger should be a function(arrayOfPayloads)')

  this.merger = merger

  if ( typeof shouldMergeCheck === 'function' || shouldMergeCheck == null ) {
    this.shouldMergeCheck = shouldMergeCheck || waitForAll
    this.mergeCount       = 0

    this.on('pipe', function(){
      self.mergeCount += 1
    })

    this.on('unpipe', function(){
      self.mergeCount -= 1
    })

  } else if ( typeof shouldMergeCheck === 'number' ) {
    this.shouldMergeCheck = waitForAll
    this.mergeCount       = shouldMergeCheck
  }

  this.cache = Object.create(null)
  this.threshholdValue = null
}

require('util').inherits( Merge, Transform )

require('./piping')(Merge.prototype)


Merge.prototype._transform = function _transform( item, encoding, callback ){
  var self          = this
  var cacheItem  = this.cache[ item.id ]
  if ( cacheItem === null ) {
    return callback()
  }

  if ( cacheItem === undefined ) {
    this.cache[ item.id ] = cacheItem = [ item.payload ]
    checkThreshhold(this)
  } else {
    cacheItem.push( item.payload )
  }

  if ( this.shouldMergeCheck( cacheItem, this.mergeCount) !== true ) {
    return callback()
  }

  utils.asyncReduce( cacheItem, this.merger, function reduceCallback( err, result ) {
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

  if ( listener )
    this.on( 'threshhold', listener )

  return this
}

function checkThreshhold( merge ){
  if ( merge.threshholdValue > 0) {
    var cache = merge.cache
    var filteredCache = Object.keys( cache )
                                .map( function(key){  if ( cache[key] != null ) return cache[key]  } )

    if ( filteredCache.length > merge.threshholdValue ) {
      merge.emit('threshhold', filteredCache )
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
