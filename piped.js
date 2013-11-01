var _slice = Array.prototype.slice

/**
 * you may pass any number of arguments to the constructor, they will be passed in same order to your pipe processor fucntions
 * @return {[type]} [description]
 */
module.exports = function piped(){
  var context = _slice.apply(arguments)

  return new Piped(context)
}


function Piped( context ){
  this._handled = false
  this._error = null
  this. context = context
}

var protoProps =         { handled : { get: function(){ return this._handled } }
                         , error   : { get: function(){ return this._error } }
                         , handle  : { value: function( err ) {
                                                if (err) this._error = err
                                                this._handled = true
                                              }
                                     }
                         }

Object.defineProperties(Piped.prototype, protoProps)
