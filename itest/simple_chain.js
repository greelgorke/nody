var assert = require('assert')

var cons = require('../cons')
var sink = require('../sink')
var nody = require('../nody')

describe('happy path', function() {
  it('should not fail by passing', function(done) {
    var _cons = cons()
    var _sink = sink(sinkHandle)
    var _nody = nody(nodyHandle)
    var testItem = "I'm so happy!"

    function sinkHandle( item ){
      assert.equal( testItem, item )
      done()
    }

    function nodyHandle ( item1, callback ) {
      assert.equal( testItem , item1 )
      callback()
    }

    _cons.pipe(_nody).pipe(_sink)
    _cons.pack(testItem)
    _cons.submit()
    _cons.end()
  })

  it('should not fail by replacing', function(done) {
    var _cons = cons()
    var _sink = sink(sinkHandle)
    var _nody = nody(nodyHandle)
    var testItem = "I'm so happy!"

    function sinkHandle( item ){
      assert.equal( testItem + testItem, item )
      done()
    }

    function nodyHandle ( item1, callback ) {
      assert.equal( testItem , item1 )
      callback(null, item1 + item1 )
    }

    _cons.pipe(_nody).pipe(_sink)
    _cons.pack(testItem)
    _cons.submit()
    _cons.end()
  })
})
