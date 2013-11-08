var stream = require('stream')
var assert = require('assert')

var piping = require('../piping')


describe('piping', function() {
  it('should augment a stream with custom .pipe', function() {
    var testSource = new stream.PassThrough()
    piping( testSource )
    assert.strictEqual    ( typeof testSource.pipe, 'function' )
    assert.notStrictEqual ( Object.getPrototypeOf( testSource ).pipe , new stream.Stream().pipe )
  })

  it('should throw a TypeError if candidate doesn\'t have pipe method', function() {
    assert.throws( function(){
      piping({})
    } , TypeError)
  })
})

describe('new pipe', function() {
    it('should throw an Error if candidate stream isn\'t in object mode', function() {
      var testSource = new stream.PassThrough()
      piping( testSource )
      var testTarget = new stream.PassThrough()

      assert.throws( function(){
        testSource.pipe( testTarget )
      } , Error)
    })

    it('should not throw if candidate stream is in object mode', function() {
      var testSource = new stream.PassThrough()
      piping( testSource )
      var testTarget = new stream.PassThrough({objectMode: true})

      testSource.pipe( testTarget )
    })
})
