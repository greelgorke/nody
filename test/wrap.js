var assert = require('assert')
var stream = require('stream')

var wrap = require('../lib/wrap')


describe('wrap', function() {
  describe('constructor', function() {
    it('should fail with no consumer stream', function() {
      assert.throws( function(){
        wrap()
      }, TypeError)
    })

    it('should not fail with a consumer stream', function() {
      assert.doesNotThrow( function(){
        wrap(new stream.PassThrough({objectMode:true}))
      })
    })

    it('should save the producer streams', function() {
      var _wrap = wrap( new stream.PassThrough({objectMode:true})
                        , new stream.PassThrough({objectMode:true})
                        , new stream.PassThrough({objectMode:true})
                        )

      assert( Array.isArray(_wrap.producers))
      assert( _wrap.producers.lenght = 2)

    })
  })

  describe('consuming', function() {
    it('should write to the consumer', function(done) {
      var consumer = new stream.PassThrough({objectMode:true})
      var item = "foo"
      var _wrap = wrap( consumer )

      consumer.on('readable', function(){
        var res = consumer.read()

        assert.equal( item, res )
        done()
      })

      _wrap.write(item)
    })

    it('should read from a producer', function(done) {
      var consumer = new stream.PassThrough({objectMode:true})
      var producer = new stream.PassThrough({objectMode:true})
      var item = "foo"
      var _wrap = wrap( consumer, producer )

      _wrap.on('readable', function(){
        var res = _wrap.read()

        assert.equal( item, res )
        done()
      })

      producer.write(item)
    })

    it('should read from different producers', function(done) {
      var consumer = new stream.PassThrough({objectMode:true})
      var producer1 = new stream.PassThrough({objectMode:true})
      var producer2 = new stream.PassThrough({objectMode:true})
      var item1 = "foo"
      var item2 = "foo2"
      var _wrap = wrap( consumer, producer1, producer2 )

      _wrap.once('readable', function(){
        var res = _wrap.read()

        assert.equal( item1, res )

        _wrap.once('readable', function(){
          var res = _wrap.read()

          assert.equal( item2, res )
          done()
        })
      })

      producer1.write(item1)
      producer2.write(item2)
    })
  })
})
