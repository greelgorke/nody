module.exports =  { arrayLike : function arrayLike (toTest) {
                                  return ( Array.isArray(toTest) ||
                                           ( ( ! toTest instanceof String) && toTest.toString() === '[object Arguments]' )
                                         )
                                }
                  }