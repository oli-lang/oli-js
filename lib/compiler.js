var Memory = require('./memory')
var processor = require('./processor')
var generator = require('./generator')
var _ = require('./helpers')
var errors = require('./errors')

exports = module.exports = Compiler

function Compiler(ast, options) {
  this.ast(ast)
  this.options(options)
  this.memory(options.locals)
}

Compiler.prototype.defaults = {
  locals: null,
  data: null
}

Compiler.prototype.memory = function (context) {
  var memory = this._memory = new Memory(context)
  if (_.isObject(context)) {
    memory.push(context)
  }
  return memory
}

Compiler.prototype.ast = function (ast) {
  if (_.isObject(ast)) {
    this._ast = ast
  }
  return this
}

Compiler.prototype.options = function (options) {
  if (_.isObject(options)) {
    this._options = _.extend(_.clone(this.defaults), options)
  }
  return this._options
}

Compiler.prototype.compile = function () {
  var result = processor(this._ast, this._memory)

  if (result.length === 1) {
    result = result[0]
  }
  if (_.isMutable(result)) {
    result = generator(result, this._memory)
  }

  return result
}
