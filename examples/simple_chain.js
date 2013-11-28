var assert = require('assert')

var cons = require('../lib/cons')
var sink = require('../lib/sink')
var node = require('../lib/node')

describe('happy path', function() {
  var _cons, _sink, _node, testItem

  beforeEach(function(){
    _cons = cons()
    _sink = sink(sinkHandle)
    _node = node(nodeHandle)

    testItem = "I'm so happy!"

    function sinkHandle( item ){
      assert.equal( testItem, item )
    }

    function nodeHandle ( item1, callback ) {
      assert.equal( testItem , item1 )
      callback()
    }

    _cons
      .pipe(_node)
    .pipe(_sink)

  })

  it('should pack and submit', function(done) {
    _sink.on('finish', function(){done()})
    _cons.pack(testItem)
    _cons.submit()
    _cons.end()
  })

  it('should just write', function(done) {
    _sink.on('finish', function(){done()})
    _cons.write(testItem)
    _cons.end()
  })
})
