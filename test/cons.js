var assert = require('assert')
var stream = require('stream')
var piped = require('../lib/piped')

var cons = require('../lib/cons')


describe('cons', function() {
  it('should pass the context in simple write', function(done) {
    var contextProvided = 'the context'
    var consumer = cons()

    consumer.on('readable', function(){
      var result = consumer.read()
      assert.equal( contextProvided, result.payload[0] )
      done()
    })
    consumer.write(contextProvided)
    consumer.end()

  })

  it('should pass the sontext with pack/submit', function(done) {
    var contextProvided = 'the context'
    var consumer = cons()

    consumer.on('readable', function(){
      var result = consumer.read()
      assert.equal( contextProvided, result.payload[0] )
      assert.equal( contextProvided, result.payload[1] )
      assert.equal( contextProvided, result.payload[2] )
      done()
    })

    consumer.pack(contextProvided,contextProvided)
    consumer.pack(contextProvided)
    consumer.submit()
    consumer.end()
  })

  it('should not submit if nothing there to submit', function(done) {
    var contextProvided = 'the context'
    var consumer = cons()

    consumer.on('readable', function(){
      assert.fail()
    })

    consumer.on('finish', done)

    consumer.submit()
    consumer.end()
  })

  it('should not mix writes and packs', function(done) {
    var contextProvided = 'the context'
    var contextWritten = 'written!'
    var consumer = cons()

    consumer.on('finish', done)

    consumer.on('readable', function(){
      var result = consumer.read()
      assert.equal( contextWritten, result.payload[0] )
      assert( ! Array.isArray( result ))
    })

    consumer.pack(contextProvided,contextProvided)
    consumer.write(contextWritten)
    consumer.end()
  })

})