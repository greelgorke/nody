var _slice = Array.prototype.slice

var prot = Object.create(null, {
  handle : {
    value:function(err) {
      if (err) {
        this.error = err
      }
      this.handled = true
    }
  }
})

/**
 * you may pass any number of arguments to the constructor, they will be passed in same order to your pipe processor fucntions
 * @return {[type]} [description]
 */
module.exports = function piped(){
  var handled = false
  var error = null
  var context = _slice.apply(arguments)
  var pipeItemDescriptor = {
        handled: { get: function(){ return handled }  },
        error:   { get: function(){ return error }    },
        context: { get: function(){ return context }  },
        handle:  { value: handle                      }
      }
  var pipeItem = Object.create( null, pipeItemDescriptor )

  function handle(err) {
    if (err) {
      this.error = err
    }
    this.handled = true
  }

  return pipeItem
}
