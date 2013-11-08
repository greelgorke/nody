var assert = require('assert')
var piped = require('../lib/piped')

describe( 'piped', function(){
  it('should create an object', function(){
    var obj = piped()
    assert.notEqual(obj, null, 'Not created')
  })

  it('should create an object with context', function(){
    var obj = piped('foo', 'bar', 'baz')

    assert.notEqual     ( obj, null, 'Not created' )
    assert              ( Array.isArray(obj.context), 'Context is not right: ' + obj.context )
    assert.equal        ( obj.context.length, 3, 'Context has wrong number of arguments' )
    assert.strictEqual  ( obj.context[0], 'foo')
  })

  it('should handle the context', function(){
    var obj = piped('foo')

    assert.ok( obj.handled === false, 'pre...')

    obj.handle()

    assert.ok( obj.handled === true, '...post ' + obj.handled)

  })
})