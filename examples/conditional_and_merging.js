var assert = require('assert')
var nody = require('../nody')

describe.only('conditional branching and merging', function() {
  var forks = "forks"
  var fire = "fire"
  var _cons, _cond, _node1, _node2, _merge, _sink

  beforeEach(function(){
    var count = 0
    _cons = nody.cons()
    _cond = nody.cond()
    _merge= nody.merge(mergerFunc, function(){return true})
    _sink = nody.sink(function( payload ){
      _sink.emit('dones', payload)
    })

    _node1 = nody.node(function(payload, callback){
      assert( payload === forks )
      callback()
    })

    _node2 = nody.node(function(payload, callback){
      assert( payload === fire )
      callback(null, payload + payload)
    })

    function mergerFunc(payload1, payload2, callback){
      callback(null, payload1 )
    }

    _cons
      .pipe(_cond)
        _cond.pipe( function( payload , cb ){ cb( payload === forks ) }, _node1 )
          .pipe(_merge)
        _cond.pipe( function( payload, cb ){ cb( payload === fire ) }, _node2 )
          .pipe(_merge)
      _merge.pipe(_sink)

  })

  it('should pass payloads', function(done) {
    var result = []
    var expectedPayloadsNumber = 9

    _sink.on('dones', function(payload){
      result.push(payload)

      if(result.length == expectedPayloadsNumber) {
        console.log(result)
        done()
      }
    })

    _cons.write(fire)
    _cons.write(fire)
    _cons.write(forks)
    _cons.write(fire)
    _cons.write(fire)
    _cons.write(forks)
    _cons.write(fire)
    _cons.write(forks)
    _cons.write(fire)
    _cons.end()
  })
})

