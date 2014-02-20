'use strict'

var _ = require('./helpers')
var tokens = require('./tokens')
var CompileError = require('./errors').CompileError

/**
 * AST traversal
 */

exports = module.exports = transformer

function transformer(ast, memory) {
  var traverse = astTraverse(memory)
  return _.mapEach(ast.body, traverse)
}

transformer.tokens = tokens

function astTraverse(memory) {
  return function traverse(node) {
    var result, type
    if (_.isObject(node)) {
      type = node.type
      if (_.has(nodes, type)) {
        result = nodes[type](node, traverse, memory)
      } else {
        throw new CompileError('AST node type "' + type + '" is not supported')
      }
    }
    return result
  }
}

/**
 * AST nodes transformer
 */

var nodes = transformer.nodes = {
  StringLiteral: StringLiteral,
  IntegerLiteral: Literal,
  DecimalLiteral: Literal,
  HexadecimalLiteral: Literal,
  BooleanLiteral: Literal,
  NilLiteral: Literal,
  ExpressionStatement: ExpressionStatement,
  ListExpression: ListExpression,
  TopListExpression: TopListExpression,
  BodyStatement: BodyStatement,
  BlockStatement: BlockStatement,
  ValueStatement: BlockStatement,
  PipeStatement: PipeStatement,
  Identifier: Identifier,
  IdentifierExpression: IdentifierExpression,
  ReferenceExpression: ReferenceExpression,
  AttributeExpression: AttributeExpression,
  BinaryExpression: BinaryExpression,
  UnaryExpression: UnaryExpression
}

function Literal(node) {
  return node.value
}

function StringLiteral(node, traverse) {
  var value = node.value
  if (node.template) {
    value = stringReferenceReplace(value)
  }
  return value
}

function ListExpression(node, traverse) {
  return _.mapEach(node.elements, function (element) {
    return traverse(element, node)
  })
}

function TopListExpression(node, traverse) {
  return [
    _.mapEach(node.elements, function (element) {
      return traverse(element, node)
    })
  ]
}

function ExpressionStatement(node, traverse) {
  return traverse(node.expression)
}

function BodyStatement(node, traverse) {
  if (_.isObject(node.body)) {
    return traverse(node.body)
  } else {
    return _.mapEach(node.body, function (element) {
      return traverse(element, node)
    })
  }
}

function BlockStatement(node, traverse, memory) {
  var duplicateKeys
  var value = {}
  var left = traverse(node.left)
  var body = traverse(node.right)

  if (node.operator === tokens.ASSIGN_NOT) {
    value[left.name] = null
    return value
  }

  if (_.isArray(body) && isBlockOperator(node)) {
    body = processBlockBody(body)
  }

  if (node.operator === tokens.EQUAL) {
    memory.allocate(left.name, body)
    return
  }

  value[left.name] = createNode(node, {
    $$name: left.name,
    $$operator: node.operator,
    $$duplicateKeys: duplicateKeys,
    $$attributes: left.attributes,
    $$expression: left.expression,
    $$body: body
  })

  if (left.expression) {
    if (_.isArray(left.expression)) {
      _.forEach(left.expression, function (node) {
        if (node.type === 'reference') {
          memory.allocate(node.value, body)
        }
      })
    } else if (left.expression.type === 'reference') {
      memory.allocate(left.expression.value, body)
    }
  }

  return value

  function isBlockOperator(node) {
    return node.operator === tokens.ASSIGN || node.operator === tokens.EQUAL
  }

  function processChildNode(buf, child) {
    for (var key in child) {
      if (_.has(child, key)) {
        if (_.has(buf, key)) {
          buf[key] = [ buf[key] ]
          buf[key].push(child[key])
          if (!duplicateKeys) {
            duplicateKeys = []
          }
          duplicateKeys.push(key)
        } else {
          buf[key] = child[key]
        }
      }
    }
  }

  function processBlockBody(body) {
    var child
    var buf = {}
    var hasPrimitives = false
    for (var key in body) {
      if (_.has(body, key)) {
        child = body[key]
        if (!_.isObject(child)) {
          hasPrimitives = true
          break
        }
        processChildNode(buf, child)
      }
    }
    return hasPrimitives ? body : buf
  }
}

function PipeStatement(node, traverse) {
  return traverse(node.body)
}

function IdentifierExpression(node, traverse) {
  var attrsStore, value
  var attrs = node.attributes
  var name = traverse(node.id)
  var expr = node.expression

  if (_.isArray(expr)) {
    expr = _.mapEach(expr, function (expr) {
      return traverse(expr)
    })
  } else {
    expr = traverse(expr)
  }

  if (attrs) {
    attrsStore = _.mapEach(attrs, function (attribute) {
      return traverse(attribute)
    })
  }

  if (!expr && name.type === 'reference') {
    expr = name
    name = name.value
  }

  value = createNode(node, {
    name: name,
    attributes: attrsStore,
    expression: expr
  })

  return value
}

function Identifier(node, traverse) {
  return node.name
}

function ReferenceExpression(node, traverse) {
  return referenceStringTemplate(node.name)
}

function AttributeExpression(node, traverse) {
  var value
  var identifier = traverse(node.left)
  var assignment = traverse(node.right)

  if (assignment === undefined) {
    assignment = null
  }

  value = {
    name: identifier,
    value: assignment
  }

  return value
}

function BinaryExpression(node, traverse) {
  var left = traverse(node.left)
  var right = traverse(node.right)
  return [ left, right ]
}

function UnaryExpression(node, traverse) {
  var value = createNode(node, {
    value: traverse(node.argument, node)
  })

  switch (node.operator) {
    case tokens.RELATIONAL:
      value.type = 'reference'
      value.visible = true
      break
    case tokens.AMPERSAND:
    case tokens.AMPERSAND_NOT:
    case tokens.RELATIONAL_NOT:
      value.type = 'reference'
      value.visible = false
      break
    case tokens.EXTEND:
      value.type = 'extend'
      break
    case tokens.MERGE:
      value.type = 'merge'
      break
  }

  return value
}

//
// Helpers
//

function referenceStringTemplate(str) {
  return '$$$' + str + '$$$'
}

function createNode(astNode, obj) {
  if (astNode.loc) {
    obj.$$loc = astNode.loc
  }
  return obj
}

var alphanumeric = 'a-zA-Z0-9'
var symbols = '\\-\\_\\^\\º\\ç\\.\\$\\@\\€\\?\\%\\+\\;'
var rawExpression = new RegExp('\\*(['+ alphanumeric + symbols +']+)', 'gi')
var bracesExpression = new RegExp('\\*[\{](['+ alphanumeric + symbols +']+)[\}]', 'gi')
var quotesExpression = new RegExp('\\*[\'|\"|\\\'|\\\"](['+ alphanumeric + symbols +']+)[\'|\"|\\\'|\\\"]', 'gi')

function stringReferenceReplace(value) {
  [ rawExpression, bracesExpression, quotesExpression ]
    .forEach(replace)

  return value

  function replace(pattern) {
    value = value.replace(pattern, function (m, match) {
      return referenceStringTemplate(match)
    })
  }
}
