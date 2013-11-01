var assert = require('assert')
var stream = require('stream')

var chainlock = require('../chainlock')



describe('chainlock', function() {
    it('should pass the context in simple case', function(done) {
      var contextProvided = 'the context'
      var cl = chainlock( fallThroughHandler )
      var head = cl.head
      var tail = cl.tail

      function fallThroughHandler( err, context){
        assert( err != null )
        assert.equal( contextProvided, context )
      }

      tail.on( 'finish', done )
      head.pipe(tail)

      head.write(contextProvided)
      head.end()
    })

    it('should be compatible', function(done) {
      var contextProvided = 'the context'
      var cl = chainlock()
      var head = cl.head
      var tail = cl.tail
      var between = new stream.Transform( {objectMode: true })

      between._transform = function( chunk, enc, cb ){
        assert.equal( chunk.context, contextProvided, 'chunk is wrong' )
        this.push(chunk)
        cb()
      }

      tail.on( 'finish', done )
      head.pipe(between).pipe(tail)
      head.write(contextProvided)
      head.end()
    })

    it.only('should handle errors', function(done) {
      var contextProvided = 'the context'
      var cl = chainlock()
      var head = cl.head
      var tail = cl.tail
      var between = new stream.Transform( {objectMode: true })

      between._transform = function( chunk, enc, cb ){
        cb(new Error())
      }

      tail.on( 'finish', done )
      head.pipe(between).pipe(tail)
      head.write(contextProvided)
      head.end()

    })
})