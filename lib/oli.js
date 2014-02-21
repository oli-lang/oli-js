'use strict'

var _ = require('./helpers')
var parser = require('./parser').parse
var Compiler = require('./compiler')
var errors = require('./errors')

var empty = ''
var oli = exports = module.exports = {}

//
// Expose the public API
//

oli.version = '0.1.0-rc.1'
oli.parser = parser
oli.Compiler = Compiler

function parse(code, options) {
  var ast = oli.ast(code, options)

  if (!ast) {
    return empty
  }
  if (!ast.body.length) {
    return empty
  }

  options = _.extend({ locals: null }, options)

  return oli.compile(ast, options, code)
}

oli.parse = oli.transpile = parse

function compile(ast, options, code) {
  try {
    return new Compiler(ast, options).compile()
  } catch (e) {
    rethrow(e, code)
  }
}

oli.compile = oli.run = compile

function parseMeta(code, options) {
  options = _.extend(_.clone(options), { meta: true })
  return oli.parse(code, options)
}

oli.parseMeta = oli.meta = parseMeta

function ast(code, options) {
  var ast

  if (!_.isString(code)) {
    if (_.isBrowser) {
      return null
    }
    if (code instanceof Buffer) {
      code = code.toString()
    } else {
      throw new errors.TypeError('First argument must be an string or buffer')
    }
  }

  options = _.extend({ loc: false, comments: false, meta: false }, options)

  try {
    ast = parser(code, options)
  } catch (e) {
    rethrow(e, code)
  }

  return ast
}

oli.ast = oli.parseAST = ast

function tokens(code, options) {
  var tokens = []
  var loc = options ? options.loc : false

  _.walk(oli.ast(code, options), function (node) {
    var value
    if (_.isString(node.value)) {
      value = addToken(loc, node)
    } else if (_.isString(node.name)) {
      value = addToken(loc, node, 'name')
    } else if (node.operator) {
      value = addToken(loc, node, 'operator', loc)
    }
    if (value) {
      tokens.push(value)
    }
  })

  return tokens
}

oli.tokens = oli.parseTokens = tokens

//
// Especific support per-engine environment
//

if (_.isBrowser) {
  require('./engine/browser')(oli)
} else {
  require('./engine/node')(oli)
}

//
// Helpers
//

function addToken(loc, node, type) {
  var token = { type: node.type, value: node[type || 'value'] }
  if (loc === true) {
    token.loc = _.clone(node.loc)
  }
  return token
}

function rethrow(error, code) {
  throw errors.addErrorLines(error, code)
}
