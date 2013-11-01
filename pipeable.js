var CONST = require('./constants')

module.exports = function pipeable ( nd ) {
  var protoPipe = Object.getPrototypeOf( nd ).pipe
  var oldShouldProceed = nd.shouldProceed

  if( ! ( typeof oldShouldProceed === 'function' ) )
    oldShouldProceed = null

  function pipe ( s ) {
    nd.on( CONST.events.EVENT_STATE_CHANGED, function(){ return s.onPipeStateChange.apply(s , arguments ) } )
    return protoPipe.apply( this, arguments )
  }

  function onPipeStateChange ( state ) {
    this.state = state
    this.emit( CONST.events.EVENT_STATE_CHANGED, state )
  }

  function shouldProceed () {
    var procceed = oldShouldProceed && oldShouldProceed.apply(this, arguments)
    return proceed && this.state !== CONST.states.PIPE_STATE_CLOSED && this.state !== CONST.states.PIPE_STATE_ERROR
  }

  nd.pipe = pipe
  nd.shouldProceed = shouldProceed
  nd.onPipeStateChange = onPipeStateChange

}
