var _ = require('./helpers')
var parse = require('./parser').parse
var walk = require('./walk')
var compiler = require('./compiler')

var oli = module.exports = {}

oli.version = '0.1.0'

oli.parse = oli.eval = function parse(code, options) {
  var ast = oli.ast(code, options)

  if (!ast) {
    return null
  }
  if (!ast.body.length) {
    return null
  }

  options = _.extend({ locals: null }, options)

  return oli.compile(ast, options, code)
}

oli.compile = oli.run = function compile(ast, options, code) {
  try {
    return compiler(ast, options)
  } catch (err) {
    throw _.handleError(err, code)
  }
}

oli.ast = oli.parseAST = function ast(code, options) {
  var ast

  if (typeof code !== 'string') {
    return null
  }

  options = _.extend({ loc: false, comments: false, meta: true }, options)

  try {
    ast = parse(code, options)
  } catch (err) {
    throw _.handleError(err, code)
  }

  return ast
}

oli.tokens = oli.parseTokens = function tokens(code, options) {
  var tokens = []
  var loc = options ? options.loc : false

  walk(oli.ast(code, options))(function (node) {
    if (typeof node.value === 'string') {
      tokens.push(addToken(node))
    } else if (typeof node.name === 'string') {
      tokens.push(addToken(node, 'name'))
    } else if (node.operator) {
      tokens.push(addToken(node, 'operator'))
    }
  })

  return tokens

  function addToken(node, type) {
    var token = { type: node.type, value: node[type || 'value'] }
    if (loc === true) {
      token.loc = _.clone(node.loc)
    }
    return token
  }
}

if (_.isBrowser) {
  _.extend(oli, require('./browser')(oli))
}
