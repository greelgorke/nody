var assert = require('assert')
var stream = require('stream')

var cons = require('../lib/cons')


describe('cons', function() {
  it('should pass the context in simple write', function(done) {
    var contextProvided = 'the context'
    var consumer = cons()

    consumer.on('readable', function(){
      var result = consumer.read()
      assert.equal( contextProvided, result )
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
      assert.equal( contextProvided, result[0] )
      assert.equal( contextProvided, result[1] )
      assert.equal( contextProvided, result[2] )
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
    var consumer = cons()

    consumer.on('finish', done)

    consumer.on('readable', function(){
      var result = consumer.read()
      assert.equal( contextProvided, result )
      assert( ! Array.isArray( result ))
    })

    consumer.pack(contextProvided,contextProvided)
    consumer.write(contextProvided)
    consumer.end()
  })

})