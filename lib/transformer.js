'use strict'

var _ = require('./helpers')
var nodes = require('./nodes')
var CompileError = require('./errors').CompileError

exports = module.exports = transformer

var types = transformer.types = {
  StringLiteral: 'StringLiteral',
  IntegerLiteral: 'Literal',
  DecimalLiteral: 'Literal',
  HexadecimalLiteral: 'Literal',
  BooleanLiteral: 'Literal',
  NilLiteral: 'Literal',
  ExpressionStatement: 'ExpressionStatement',
  ListExpression: 'ListExpression',
  TopListExpression: 'TopListExpression',
  BodyStatement: 'BodyStatement',
  BlockStatement: 'BlockStatement',
  ValueStatement: 'BlockStatement',
  PipeStatement: 'PipeStatement',
  Identifier: 'Identifier',
  IdentifierExpression: 'IdentifierExpression',
  ReferenceExpression: 'ReferenceExpression',
  AttributeExpression: 'AttributeExpression',
  BinaryExpression: 'BinaryExpression',
  UnaryExpression: 'UnaryExpression'
}

transformer.nodes = nodes

function transformer(ast, memory) {
  var traverse = astTraverse(memory)
  return _.mapEach(ast.body, traverse)
}

function astTraverse(memory) {
  return function traverse(node) {
    var result, type

    if (!_.isObject(node)) return;
    type = node.type
    if (_.has(types, type)) {
      result = nodes[types[type]](node, traverse, memory)
    } else {
      throw new CompileError('AST node type "' + type + '" is not supported')
    }

    return result
  }
}
