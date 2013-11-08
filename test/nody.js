var assert = require('assert')
var piped = require('../piped')


var nody = require('../nody')


describe('nody', function() {
  it('should throw an error on construction, when no processor being provided', function() {
    assert.throws(function(){
      nody()
    }, Error)
  })

  it('should call the provided processor', function( done ) {
    var ctx = 'lalalala'
    var node = nody( function(item, callback){
      assert.equal( ctx, item )
      assert( typeof callback == 'function')
      done()
    })

    node.write( [ctx] )
    node.end()

  })

  it('should call the provided processor and replace the item', function( done ) {
    var ctx = 'lalalala'
    var node = nody( function(item, callback){
      callback(null, item+item)
    })

    node.on('readable', function(){
      assert.equal( ctx+ctx, node.read()[0])
      done()
    })

    node.write( [ctx] )
    node.end()

  })

  it('should call the provided processor and emit error', function( done ) {
    var ctx = 'lalalala'
    var node = nody( function(item, callback){
      callback(new Error('foo'))
    })

    node.on('error', function(){
      done()
    })

    node.write( [ctx] )
    node.end()
  })
})