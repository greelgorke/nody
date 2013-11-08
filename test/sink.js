var assert = require('assert')
var stream = require('stream')

var sink = require('../sink')

describe('sink', function() {

    it('should pass the context in simple case', function(done) {
      var contextProvided = 'the context'
      var _sink = sink( fallThroughHandler )

      function fallThroughHandler( context ){
        assert.equal( contextProvided, context )
        done()
      }

      _sink.write([contextProvided])
      _sink.end()
    })
})