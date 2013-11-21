exports.asyncReduce = function asyncReduce(array, reducer, callback){
  var count = 0
  var arr = array.slice()
  var first = arr.shift()
  var second = arr.shift()

  var next = function next (err, result) {
    if ( err ) return callback( err )

    var n = arr.shift()

    if ( n === undefined ) {
      return callback( null, result )
    }

    reducer(result, n, next)
  }

  reducer(first, second, next )
}