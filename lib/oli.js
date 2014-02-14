var _ = require('./helpers')
var errorHandler = require('./errors').handle
var parse = require('./parser').parse
var walk = require('./walk')
var Compiler = require('./compiler')

var oli = exports = module.exports = {}

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
    return new Compiler(ast, options).compile()
  } catch (err) {
    err = errorHandler(err, code)
    outputError(err)
    throw err
  }
}

oli.ast = oli.parseAST = function ast(code, options) {
  var ast

  if (!_.isString(code)) {
    if (_.isBrowser) {
      return null
    }
    if (code instanceof Buffer) {
      code = code.toString()
    }
  }

  options = _.extend({ loc: false, comments: false, meta: false }, options)

  try {
    ast = parse(code, options)
  } catch (err) {
    err = errorHandler(err, code)
    outputError(err)
    throw err
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
  require('./browser')(oli)
}

function outputError(error) {
  if (!_.isBrowser) {
    _.log(error.fullMessage)
    if (error.errorLines) {
      _.log('\n' + error.errorLines.join('\n'))
    }
  }
}
