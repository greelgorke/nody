var stream = require('stream')
var pipeable = require('./piped')

function ChainLock( shouldProceed, fallThroughHandler ){
  if( ! (this instanceof ChainLock) ) return new ChainLock( dequeue )

  stream.Duplex.call( this, { objectMode: true } )

  this.queue = []
  this.shouldProceed = shouldProceed
  this.fallThroughHandler = fallThroughHandler
}

require('util').inherits( ChainLock, stream.Duplex )

ChainLock.prototype._read = function ( size ) {
  if ( ! this.shouldProceed() ) {
    this.emit('pipeline-state', 'closed')
    return this.push(null)
  }

  var nextItem = this.queue.shift()

  if ( nextItem == null ) return this.push('')

  this.push(nextItem)
};

ChainLock.prototype._write = function ( item, encoding, callback ) {
  if ( ! this.shouldProceed() ) {
    this.emit('pipeline-state-change', 'closed')
    return callback()
  }

  var handled = item.handled

  if ( this.shouldProceed() && !handled ) {
    this.fallThroughHandler( new Error('Pipeitem not handled.') , item )
  }
  callback()
};

ChainLock.prototype.enqueue = function() {
  this.queue.push( piped.apply( null, arguments ) )

};

module.exports = ChainLock
