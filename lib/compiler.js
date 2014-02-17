'use strict'

var Memory = require('./memory')
var transformer = require('./transformer')
var generator = require('./generator')
var _ = require('./helpers')
var CompilerError = require('./errors').CompilerError

exports = module.exports = Compiler

function Compiler(ast, options) {
  this.ast(ast)
  this.options(options)
  this._memory = new Memory()
  if (this.options.locals) {
    this.memory(this.options.locals)
  }
}

Compiler.nodes = transformer.nodes

Compiler.prototype.options = {
  locals: null,
  data: null
}

Compiler.prototype.options = function (options) {
  if (_.isObject(options)) {
    this.options = _.extend(this.options, options)
  }
  return this.options
}

Compiler.prototype.memory = function (context) {
  if (_.isObject(context)) {
    this._memory.push(context)
  }
  return this._memory
}

Compiler.prototype.ast = function (ast) {
  if (_.isObject(ast)) {
    this._ast = ast
  }
  return this
}

Compiler.prototype.compile = function () {
  var result = transformer(this._ast, this._memory)

  if (result.length === 1) {
    result = result[0]
  }
  if (_.isMutable(result)) {
    result = generator(result, this._memory)
  }

  return result
}
