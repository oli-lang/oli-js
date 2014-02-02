var _ = require('./helpers')
var parse = require('./parser').parse
var traverse = require('./traverse')
var compiler = require('./compiler')

module.exports = Oli

Oli.version = '0.1.0'

function Oli(code, options) {
  Oli.parse(code, options)
}

Oli.parse = Oli.eval = function (code, options) {
  var ast = Oli.ast(code, options)

  if (!ast) {
    return '';
  }
  if (!ast.body.length) {
    return '';
  }
  if (options == null) {
    options = { locals: null }
  }

  return Oli.compile(ast, options, code)
}

Oli.compile = function (ast, options, code) {
  try {
    return compiler(ast, options)
  } catch (err) {
    handleError(err, code)
  }
}

Oli.ast = Oli.parseAST = function (code, options) {
  var ast

  if (typeof code !== 'string') {
    return null
  }

  if (options == null) {
    options = { loc: true, comments: false }
  }

  try {
    ast = parse(code)
  } catch (err) {
    handleError(err, code)
  }

  if (options.loc === false) {
    ast = traverse(ast).map(function (node) {
      if (node.loc) {
        this.update(_.omit(node, 'loc'));
      }
    })
  }

  return ast
}

Oli.tokens = Oli.parseTokens = function (code, options) {
  return Oli.ast(code, options)
}

if (_.isBrowser) {
  _.extend(Oli, require('./browser')(Oli))
}

function handleError(err, code) {
  _.logError(err, code);
  throw new err;
}

