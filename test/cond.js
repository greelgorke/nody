var assert = require('assert')
var stream = require('stream')
var piped = require('../lib/piped')

var cond = require('../lib/cond')

function positiveMatcher(){
  var cb = [].slice.call(arguments).pop()
  assert( cb != null )
  cb(true)
}

function negativeMatcher(){
  var cb = [].slice.call(arguments).pop()
  assert( cb != null )
  cb(false)
}

var testPipe = new stream.PassThrough({objectMode: true})

describe('cond', function() {
  describe('pipe', function() {
    /**
     * Let's think about the interface of this stream:
     *
     * It's supposed to be piped into multiple streams,
     * but only to forward to one of the piped streams depending on the result of a provided
     * matcher function.
     *
     * So how do we want to use it?
     *
     * var myCond = cond()
     * myCond
     *   .pipe(matcherFunction, stream)
     *     //it's the stream now
     *     .pipe(more).pipe(things).pipe(todo)
     *
     * myCond
     *   .pipe(otherMather, differentPipeline)
     *     //it's the differentPipeline
     *     .pipe(anotherBranch).pipe(theEnd)
     *
     * matcher signature:
     *   function mather(input1, input2, moreInputTill, callback)
     */
    it('should accept matcher in pipe', function(done) {
      var _cond = cond()
      var testPipe = new stream.PassThrough({objectMode: true})
      _cond.pipe(positiveMatcher, testPipe)

      assert( _cond._matchers[0] === positiveMatcher )
      assert( _cond._matchingStreams[0] === testPipe )

      done()
    })

    it('should return accepted matching stream in pipe', function(done) {
      var _cond = cond()
      var testPipe = new stream.PassThrough({objectMode: true})
      var pipedStream = _cond.pipe( positiveMatcher, testPipe )

      assert( testPipe === pipedStream )
      done()
    })

    it('should return stream without matcher in pipe', function(done) {
      var _cond = cond()
      var testPipe = new stream.PassThrough({objectMode: true})
      var pipedStream = _cond.pipe( testPipe )

      assert( testPipe === pipedStream )
      done()
    })

    /**
     * what happens if someone pipe without a matcher?
     *   it's a catch-all pipe and is used as fallback, when no matcher match.
     */
    it('should proxy the core pipe', function(done) {
      var _cond = cond()


      testPipe.on('pipe', function(s){
        assert.strictEqual( _cond, s )
        done()
      })
      _cond.pipe(testPipe)

      assert( _cond._matchers[0] == null )
      assert( _cond._matchingStreams[0] == null )
    })

     /**
      * what happens if someone calls pipe without stream
      *   an error should be thrown
      */
    it('should proxy the core pipe', function() {
      var _cond = cond()

      assert.throws(function(){
        _cond.pipe(positiveMatcher)
      }, Error)
    })
  })

  describe('matcher', function() {
    it('should pass the params and a callback to the matcher function', function(done) {
      var _cond = cond()
      var p1 = "foo"
      var p2 = {bar : true}
      function assertingMatcher(param1, param2, callback){
        assert.strictEqual( p1, param1 )
        assert.strictEqual( p2, param2 )
        assert            ( typeof callback == 'function' )
        done()
      }

      _cond.pipe(assertingMatcher, testPipe)
      _cond.write(piped(p1, p2))
      _cond.end()
    })

    it('should write to the positive matching stream, not the negative', function(done) {
      var _cond = cond()
      var p1 = "foo"
      var positiveStream = new stream.Writable({objectMode: true})
      positiveStream._write = function(item, enc, cb ){
        assert.equal( p1, item.payload[0])
        done()
      }
      var negativeStream = new stream.Writable({objectMode: true})
      negativeStream._write = function(item, enc, cb ){
        assert.fail()
      }

      _cond.pipe(negativeMatcher, negativeStream)
      _cond.pipe(positiveMatcher, positiveStream)
      _cond.write(piped(p1))
      _cond.end()
    })

    it('should write to the first positive matching stream, not the second', function(done) {
      var _cond = cond()
      var p1 = "foo"

      var positiveStream1 = new stream.Writable({objectMode: true})
      positiveStream1._write = function(item, enc, cb ){
        assert.equal( p1, item.payload[0])
      }

      var positiveStream2 = new stream.Writable({objectMode: true})
      positiveStream2._write = function(item, enc, cb ){
        assert.fail()
      }

      _cond.on('finish', function(){done()})
      _cond.pipe(positiveMatcher, positiveStream1)
      _cond.pipe(positiveMatcher, positiveStream2)
      _cond.write(piped(p1))
      _cond.end()
    })

    it('should write to the catch-all stream, if nothing matches the second', function(done) {
      var _cond = cond()
      var p1 = "foo"
      var catchAllStream = new stream.Writable({objectMode: true})
      catchAllStream._write = function(item, enc, cb ){
        assert.equal( p1, item.payload[0])
        done()
      }
      var negativeStream = new stream.Writable({objectMode: true})
      negativeStream._write = function(item, enc, cb ){
        assert.fail()
      }

      _cond.pipe(negativeStream, negativeStream)
      _cond.pipe(catchAllStream)
      _cond.write(piped(p1))
      _cond.end()
    })
  })

})