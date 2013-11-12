var assert = require('assert')

var cons = require('../lib/cons')
var sink = require('../lib/sink')
var node = require('../lib/node')

describe('happy path', function() {
  it('should not fail by passing', function(done) {
    var _cons = cons()
    var _sink = sink(sinkHandle)
    var _node = node(nodeHandle)
    var testItem = "I'm so happy!"

    function sinkHandle( item ){
      assert.equal( testItem, item )
      done()
    }

    function nodeHandle ( item1, callback ) {
      assert.equal( testItem , item1 )
      callback()
    }

    _cons.pipe(_node).pipe(_sink)
    _cons.pack(testItem)
    _cons.submit()
    _cons.end()
  })

  it('should not fail by replacing', function(done) {
    var _cons = cons()
    var _sink = sink(sinkHandle)
    var _node = node(nodeHandle)
    var testItem = "I'm so happy!"

    function sinkHandle( item ){
      assert.equal( testItem + testItem, item )
      done()
    }

    function nodeHandle ( item1, callback ) {
      assert.equal( testItem , item1 )
      callback(null, item1 + item1 )
    }

    _cons.pipe(_node).pipe(_sink)
    _cons.pack(testItem)
    _cons.submit()
    _cons.end()
  })
})
