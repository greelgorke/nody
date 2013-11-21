var assert = require('assert')
var stream = require('stream')

var subnode = require('../lib/subnode')


describe('subnode', function() {
  describe('constructor', function() {
    it('should fail with no consumer stream', function() {
      assert.throws( function(){
        subnode()
      }, TypeError)
    })

    it('should not fail with a consumer stream', function() {
      assert.doesNotThrow( function(){
        subnode(new stream.PassThrough({objectMode:true}))
      })
    })

    it('should save the producer streams', function() {
      var _sub = subnode( new stream.PassThrough({objectMode:true})
                        , new stream.PassThrough({objectMode:true})
                        , new stream.PassThrough({objectMode:true})
                        )

      assert( Array.isArray(_sub.producers))
      assert( _sub.producers.lenght = 2)

    })
  })

  describe('consuming', function() {
    it('should write to the consumer', function(done) {
      var consumer = new stream.PassThrough({objectMode:true})
      var item = "foo"
      var _sub = subnode( consumer )

      consumer.on('readable', function(){
        var res = consumer.read()

        assert.equal( item, res )
        done()
      })

      _sub.write(item)
    })

    it('should read from a producer', function(done) {
      var consumer = new stream.PassThrough({objectMode:true})
      var producer = new stream.PassThrough({objectMode:true})
      var item = "foo"
      var _sub = subnode( consumer, producer )

      _sub.on('readable', function(){
        var res = _sub.read()

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
      var _sub = subnode( consumer, producer1, producer2 )

      _sub.once('readable', function(){
        var res = _sub.read()

        assert.equal( item1, res )

        _sub.once('readable', function(){
          var res = _sub.read()

          assert.equal( item2, res )
          done()
        })
      })

      producer1.write(item1)
      producer2.write(item2)
    })
  })
})
