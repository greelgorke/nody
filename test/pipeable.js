var stream = require('stream')
var assert = require('assert')

var pipeable = require('../pipeable')
var CONST = require('../constants')

var testSource = null
var testTarget = null

describe('pipeable', function() {
  describe('should augment', function() {

    before(function(){
      testSource = new stream.PassThrough()
      pipeable( testSource )
    })

    it('a stream with custom .pipe', function() {
      assert.notStrictEqual( Object.getPrototypeOf( testSource ).pipe , new stream.Stream().pipe )
    })

    it('a stream with .shouldProceed method', function() {
      assert( typeof testSource.shouldProceed == 'function' )
    })

    it('a stream with .onPipeStateChange method', function() {
      assert( typeof testSource.onPipeStateChange == 'function' )
    })
  })
})

describe('new pipe', function() {

  before(function(){
    testSource = new stream.PassThrough()
    testTarget = new stream.PassThrough()
    pipeable( testSource )
    pipeable( testTarget )

    testSource.pipe(testTarget)
  })

  it('should wire up events', function() {
    assert.equal( testSource.listeners( CONST.events.EVENT_STATE_CHANGED ).length, 1 , 'custom pipe')
    assert.equal( testSource.listeners( 'readable' ).length , 1 , 'protopipe')
  })
})