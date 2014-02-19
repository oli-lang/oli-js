'use strict'

var _ = require('./helpers')

var operator = {
  ASSIGN:         ':',
  EQUAL:          '=',
  ASSIGN_RAW:     ':>',
  ASSIGN_NOT:     '!:',
  ASSIGN_UNFOLD:  ':-',
  ASSIGN_FOLD:    '!=',
  PIPE:           '|',
  DASH:           '-',
  DOUBLEDASH:     '--',
  RELATIONAL:     '>',
  RELATIONAL_NOT: '!>',
  AMPERSAND:      '&',
  AMPERSAND_NOT:  '!&',
  EXTEND:         '>>',
  MERGE:          '>>>'
}

var nodes = exports = module.exports = {}

nodes.Literal = function literal(node) {
  return node.value
}

nodes.StringLiteral = function stringLiteral(node, traverse) {
  var value = node.value

  if (node.template) {
    value = stringReferenceReplace(value)
  }

  return value
}

nodes.ListExpression = function listExpression(node, traverse) {
  return _.mapEach(node.elements, function (element) {
    return traverse(element, node)
  })
}

nodes.TopListExpression = function listExpression(node, traverse) {
  return [
    _.mapEach(node.elements, function (element) {
      return traverse(element, node)
    })
  ]
}

nodes.ExpressionStatement = function expressionStatement(node, traverse) {
  return traverse(node.expression)
}

nodes.BodyStatement = function bodyStatement(node, traverse) {
  if (_.isObject(node.body)) {
    return traverse(node.body)
  } else {
    return _.mapEach(node.body, function (element) {
      return traverse(element, node)
    })
  }
}

nodes.BlockStatement = function blockStatement(node, traverse, memory) {
  var value = {}
  var left = traverse(node.left)
  var body = traverse(node.right)
  var duplicateKeys

  if (node.operator === operator.ASSIGN_NOT) {
    value[left.name] = null
    return value
  }

  // refactor!!
  // suport other assignment operators
  if (_.isArray(body) && (node.operator === operator.ASSIGN || node.operator === operator.EQUAL)) {
    var objBody = {}
    var hasPrimitive = false

    body.forEach(function (item) {
      if (hasPrimitive) return;
      if (_.isObject(item)) {
        _.forEach(item, function (subitem, key) {
          if (_.has(objBody, key)) {
            objBody[key] = [ objBody[key] ]
            objBody[key].push(subitem)
            if (!duplicateKeys) {
              duplicateKeys = []
            }
            duplicateKeys.push(key)
          } else {
            objBody[key] = subitem
          }
        })
      } else {
        hasPrimitive = true
      }
    })

    if (!hasPrimitive) {
      body = objBody
    }
  }

  // hidden blocks
  if (node.operator === operator.EQUAL) {
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
}

nodes.PipeStatement = function pipeStatement(node, traverse) {
  return traverse(node.body)
}

nodes.IdentifierExpression = function identifierExpression(node, traverse) {
  var attrsStore
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

  var value = createNode(node, {
    name: name,
    attributes: attrsStore,
    expression: expr
  })

  return value
}

nodes.Identifier = function identifier(node, traverse) {
  return node.name
}

nodes.ReferenceExpression = function referenceExpression(node, traverse) {
  return referenceStringTemplate(node.name)
}

nodes.AttributeExpression = function attributeExpression(node, traverse) {
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

nodes.BinaryExpression = function binaryExpression(node, traverse) {
  var left = traverse(node.left)
  var right = traverse(node.right)
  return [ left, right ]
}

nodes.UnaryExpression = function unaryExpression(node, traverse) {
  var value = createNode(node, {
    value: traverse(node.argument, node)
  })

  switch (node.operator) {
    case operator.RELATIONAL:
      value.type = 'reference'
      value.visible = true
      break
    case operator.AMPERSAND:
    case operator.AMPERSAND_NOT:
    case operator.RELATIONAL_NOT:
      value.type = 'reference'
      value.visible = false
      break
    case operator.EXTEND:
      value.type = 'extend'
      break
    case operator.MERGE:
      value.type = 'merge'
      break
  }

  return value
}

//
// Helpers
//

function createNode(astNode, obj) {
  if (astNode.loc) {
    obj.$$loc = astNode.loc
  }
  return obj
}

function stringReferenceReplace(value) {
  var alphanumeric = 'a-zA-Z0-9'
  var symbols = '\\-\\_\\^\\º\\ç\\.\\$\\@\\€\\?\\%\\+\\;'
  var rawExpression = new RegExp('\\*(['+ alphanumeric + symbols +']+)', 'gi')
  var bracesExpression = new RegExp('\\*[\{](['+ alphanumeric + symbols +']+)[\}]', 'gi')
  var quotesExpression = new RegExp('\\*[\'|\"|\\\'|\\\"](['+ alphanumeric + symbols +']+)[\'|\"|\\\'|\\\"]', 'gi')

  function replace(pattern) {
    value = value.replace(pattern, function (m, match) {
      return referenceStringTemplate(match)
    })
  }

  [ rawExpression, bracesExpression, quotesExpression ]
    .forEach(replace)

  return value
}

function referenceStringTemplate(str) {
  return '$$$' + str + '$$$'
}
