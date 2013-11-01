module.exports = function( fallThroughHandler ){
  return  { head : require( './head' )()
          , tail: require('./tail')( fallThroughHandler )
          }
}