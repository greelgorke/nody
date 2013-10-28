module.exports = function pipeable ( nd ) {
  var proto = Object.getPrototypeOf(nd)

  nd._shouldProceed = null

  function pipe ( s ) {
    proto.pipe.call( this, arguments )

    this.on('pipe-state-change', onPipeStateChange.bind(s) )
  }

  proto.shouldProceed = shouldProceed
  s.onPipeStateChange = onPipeStateChange
}

function onPipeStateChange ( state ) {
  this.state = state
  this.emit('pipe-state-change', state)
}

function shouldProceed () {
  var custom = typeof this._shouldProceed
  return this.state !== 'closed' && this.state !== 'error'
}
