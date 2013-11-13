var assert = require('assert')
var util = require('util')

var utils = require('../lib/utils')

describe('utils', function() {
  describe('asyncReduce', function() {
    it('should reduce right', function(done) {
      var testArr = [1,2,3,4,5,6]
      var expected = 1+2+3+4+5+6

      function reducer( sum, elem, next ){
        next(null, sum+elem)
      }

      function callback(err, result){
        assert.equal( expected, result )
        assert( testArr.length == 6 )
        done(err)
      }

      utils.asyncReduce( testArr, reducer, callback)
    })

    it('should reduce pass the error', function(done) {
      var testArr = [1,2,3,4,5,6]
      var expected = 1+2+3+4+5+6

      function reducer( sum, elem, next ){
        next(new Error())
      }

      function callback(err, result){
        assert( util.isError(err) )
        done()
      }

      utils.asyncReduce( testArr, reducer, callback)
    })
  })
})

