var traverse = require('./traverse')
var walk = require('./walk')
var _ = require('./helpers')
var nodes = require('./nodes')
var compiler = require('./compiler')

module.exports = Oli

function Oli(code, options) {
  Oli.parse(code, options)
}

Oli.parse = function (code, options) {
  var ast;

  function handleError(err, code) {
    _.logError(err, code);
    throw new err;
  }

  try {
    ast = Oli.ast(code, options)
  } catch (err) {
    handleError(err, code)
  }

  if (!ast) {
    return '';
  }
  if (!ast.body.length) {
    return '';
  }

  try {
    return compiler(ast.body)
  } catch (err) {
    handleError(err, code)
  }
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

