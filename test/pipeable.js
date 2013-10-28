var pipeable = require('../pipeable')
var assert = require('assert')

describe( 'pipeable', function(){
  it('should create an object', function(){
    var obj = pipeable()
    assert.notEqual(obj, null, 'Not created')
  })

  it('should create an object with context', function(){
    var obj = pipeable('foo', 'bar', 'baz')

    assert.notEqual( obj, null, 'Not created' )
    assert( Array.isArray(obj.context), 'Context is not right' )
    assert.equal( obj.context.length, 3, 'Context has wrong number of arguments' )
    assert.strictEqual( obj.context[0], 'foo')
  })

  it('should handle the context', function(){
    var obj = pipeable('foo')

    assert.ok( obj.handled === false)

    obj.handle()

    assert.ok( obj.handled === true)

  })
})