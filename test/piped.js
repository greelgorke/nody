var assert = require('assert')

var piped = require('../lib/piped')

describe('piped', function() {
  it('should generate a piped object', function() {
    var testArgs = ['a','b']
    var testPiped = piped.apply(null, testArgs)
    assert.deepEqual( testArgs, testPiped.payload )
  })
})