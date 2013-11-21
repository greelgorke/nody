//public
/**
 * creates an object with payoad and an id.
 * @param vararg
 */
module.exports = function piped(){
  var p = new Piped()
  p.applyPayload(arguments)
  return p
}



var _slice = Array.prototype.slice

var count = 0;
var timestamp = Date.now()
/**
 * the id of a piped object must not be a uuid but to be kind of unique for a application run.
 * and it should be be generated fast. So we use two components: a counter and a lazy updating timestamp
 * @type {Number}
 */
function generateId(){
  count += 1
  return timestamp +'_'+ count;
}

setInterval(
  function(){
    timestamp = Date.now()
    count = 0
  }
  , 1100
)

function Piped(){
  this.id = generateId()
  this.payload = []
}

Piped.prototype.setPayload = function() {
  this.payload = _slice.apply( arguments )
}

Piped.prototype.applyPayload = function(args) {
  this.setPayload.apply(this, args)
}
