'use strict'

var Memory = require('./memory')
var transformer = require('./transformer')
var generator = require('./generator')
var _ = require('./helpers')
var CompilerError = require('./errors').CompilerError

exports = module.exports = Compiler

function Compiler(ast, options) {
  this.result = null
  this.ast = ast
  this.memory = new Memory()
  this.config(options)
}

Compiler.nodes = transformer.nodes
Compiler.transformer = transformer
Compiler.generator = generator

Compiler.prototype.options = {
  meta: false,
  loc: false,
  locals: null,
  data: null
}

Compiler.prototype.config = function (options) {
  if (_.isObject(options)) {
    this.options = _.extend(this.options, options)
    if (options.locals) {
      this.push(options.locals)
    }
  }
  return this
}

Compiler.prototype.push = function (context) {
  if (_.isObject(context)) {
    this.memory.push(context)
  }
  return this
}

Compiler.prototype.clean = function (result) {
  if (!this.options.loc) {
    _.walk(result, function (node) {
      if (_.isObject(node) && node.$$loc) {
        node.$$loc = undefined
      }
    })
    result = _.clean(result)
  }
  return result
}

Compiler.prototype.compile = function () {
  var result = transformer(this.ast, this.memory)

  if (result.length === 1) {
    result = result[0]
  }
  if (this.options.meta) {
    result = _.clean(result)
  } else {
    if (_.isMutable(result)) {
      result = generator(result, this.memory)
    }
  }
  this.result = result

  return result
}
