var assert = require('assert')
var stream = require('stream')
var piped = require('../lib/piped')

var merge = require('../lib/merge')

describe('merge', function() {
  describe('pipe/unpipe', function() {
    it('should keep track of piped streams', function() {
      var _merge = merge.takeLastMerge()
      var pt1 = new stream.PassThrough({objectMode:true})
      var pt2 = new stream.PassThrough({objectMode:true})
      pt1.pipe(_merge)
      pt2.pipe(_merge)

      assert.equal( 2, _merge.mergeCount )

      pt1.unpipe(_merge)

      assert.equal( 1, _merge.mergeCount )
    })

    it('should not keep track of piped streams', function() {
      var _merge = merge( merge.strategies.firstWins, 1 )
      var pt1 = new stream.PassThrough({objectMode:true})
      var pt2 = new stream.PassThrough({objectMode:true})
      pt1.pipe(_merge)
      pt2.pipe(_merge)

      assert.equal( 1, _merge.mergeCount )

      pt1.unpipe(_merge)

      assert.equal( 1, _merge.mergeCount )
    })
  })

  describe('merger', function() {
    describe('check', function() {

      it('should not call the merger function if merger check refuses', function(done) {
        var pl1 = 'foo', pl2 = 'bar'
        var item = piped( pl1, pl2 )

        var pt = new stream.PassThrough({objectMode:true})

        function assertingMerger(arr1, arr2, callback){
          assert.fail()
        }

        var _merge = merge(assertingMerger, function(){ return false })

        _merge.on('readable', function(){
          assert.fail()
        })

        _merge.on('finish', function(){done()})
        pt.pipe( _merge )
        pt.write(item)
        pt.end()
      })

      it('should call the merger function if merger check accepts', function(done) {
        var pl1 = 'foo', pl2 = 'bar'
        var item = piped( pl1, pl2 )

        var pt = new stream.PassThrough({objectMode:true})

        function assertingMerger(arr1, arr2, callback){
          assert( Array.isArray( arr1 ) )
          assert( typeof callback === 'function' )
          done()
        }
        var mergeCheck = function(){ return true }
        var _merge = merge( assertingMerger, mergeCheck )

        _merge.on('readable', function(){
          var res = _merge.read()
          assert.deepEqual( item.payload, res.payload )
          done()
        })

        pt.pipe( _merge )
        pt.write(item)
        pt.end()
      })
    })
    describe('merge', function() {
      it('should pass one argument array to the mergerFunction', function(done) {
        var pl1 = 'foo', pl2 = 'bar'
        var item = piped( pl1, pl2 )

        var pt1 = new stream.PassThrough({objectMode:true})

        function assertingMerger(arr1, arr2, callback){
          assert( Array.isArray( arr1 ) )
          assert( arr2 == null )
          assert( typeof callback === 'function' )
          done()
        }

        var _merge = merge(assertingMerger, function(){return true})

        pt1.pipe(_merge)

        pt1.write(item)

      })

      it('should pass two argument arrays to the mergerFunction', function(done) {
        var pl1 = 'foo', pl2 = 'bar'
        var item = piped( pl1, pl2 )

        var pt1 = new stream.PassThrough({objectMode:true})

        function assertingMerger(arr1, arr2, callback){
          assert( Array.isArray( arr1 ) )
          assert( Array.isArray( arr2 ) )
          assert( typeof callback === 'function' )
          done()
        }

        var _merge = merge( assertingMerger, 2 )

        pt1.pipe(_merge)

        pt1.write(item)
        pt1.write(item)

      })

      it('should pass apply mergerFunction result', function(done) {
        var pl1 = 'foo', pl2 = 'bar'
        var item1 = piped( pl1, pl2 )

        var pt1 = new stream.PassThrough({objectMode:true})

        function merger(arr1, arr2, callback){
          callback( null, [ arr1[0] + arr2[0], arr1[1] + arr2[1] ] )
        }

        var _merge = merge( merger, 3 )

        _merge.on('readable', function(){
          var res = _merge.read()
          assert.equal( pl1+pl1+pl1 , res.payload[0] )
          assert.equal( pl2+pl2+pl2 , res.payload[1] )
          done()
        })
        pt1.pipe(_merge)

        pt1.write(item1)
        pt1.write(item1)
        pt1.write(item1)

      })
    })
  })
  describe('threshhold', function() {
    it('should emit threshhold event', function(done) {
      var _merge = merge(merge.strategies.lastWins, 4)
      var foo = piped('foo')
      var bar = piped('bar')


      _merge.onThreshold( 1, function(cache){
        assert( Array.isArray(cache) )
        assert.equal( 2, cache.length )
        done()
      })
      _merge.write( foo )
      _merge.write( bar )
    })
  })
})

