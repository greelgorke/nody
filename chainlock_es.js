var eventstream = require('event-stream')
var pipeable = require('./pipeable')

module.exports = function chainLock (shouldProceed, fallThroughHandler) {
  var queue = []

  var appReadable = eventstream.readable(function emitRequests (count, callback) {
    if (shouldProceed()){
      this.emit('end')
      return callback()
    }

    var nextItem = queue.shift()
    if ( nextItem == null ){
      this.pause()
      return callback()
    }

    return callback( null, nextItem)
  })


  appReadable

  var appWritable = eventstream.through(function write(item){
    var handled = item.handled

    if ( !handled ) {
      return fallThroughHandler(new Error('Pipeitem not handled.') ,item)
    }
  })

  var dupl = eventstream.duplex( appWritable, appReadable )

  /**
   * you may pass any number of arguments to the constructor, they will be passed in same order to your pipe processor functions
   * @return {[type]} [description]
   */
  dupl.enqueue = function enqueue(){
    var item = pipeable.apply(null, arguments)
    queue.push(item)
    this.resume()
  }
  return dupl
  }

}
