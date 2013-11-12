var assert = require('assert')
var piped = require('../lib/piped')


var node = require('../lib/node')


describe('node', function() {
  it('should throw an error on construction, when no processor being provided', function() {
    assert.throws(function(){
      node()
    }, Error)
  })

  it('should call the provided processor', function( done ) {
    var ctx = 'lalalala'
    var _node = node( function(item, callback){
      assert.equal( ctx, item )
      assert( typeof callback == 'function')
      done()
    })

    _node.write( piped(ctx) )
    _node.end()

  })

  it('should call the provided processor and replace the item', function( done ) {
    var ctx = 'lalalala'
    var _node = node( function(item, callback){
      callback(null, item+item)
    })

    _node.on('readable', function(){
      assert.equal( ctx+ctx, _node.read().payload[0])
      done()
    })

    _node.write( piped(ctx) )
    _node.end()

  })

  it('should call the provided processor and emit error', function( done ) {
    var ctx = 'lalalala'
    var _node = node( function(item, callback){
      callback(new Error('foo'))
    })

    _node.on('error', function(){
      done()
    })

    _node.write( piped(ctx) )
    _node.end()
  })
})