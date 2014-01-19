var traverse = require('./traverse')

module.exports = Oli

function Oli(code, options) {
  Oli.parse(code, options)
}

Oli.parse = function (code, options) {
  return Oli.ast(code, options)
}

Oli.ast = function (code, options) {
  var parser

  if (code == null) {
    return null
  }
  if (options == null) {
    options = { loc: true } 
  }

  return require('./parser').parse(code)
}

Oli.tokens = function (code, options) {
  return traverse.nodes(Oli.ast(code, options))
}

