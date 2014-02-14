var _ = require('./helpers')

/**
 * AST processor and transformer to intermediate code structure
 */

exports = module.exports = processor

var types = processor.types = {
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

function processor(ast, memory) {
  var traverse = astTraverse(memory)
  return _.mapEach(ast.body, function (node) {
    return traverse(node)
  })
}

function astTraverse(memory) {
  return function traverse(node) {
    var val, type
    if (!_.isObject(node)) return;
    
    type = node.type
    if (types.hasOwnProperty(type)) {
      val = transformers[types[type]](node, traverse, memory)
    } else {
      throw new errors.CompileError('AST node type "' + type + '" is not supported')
    }

    return val
  }
}

/**
 * AST node transformers
 */

var transformers = {

  Literal: function literal(node) {
    return node.value
  },

  StringLiteral: function stringLiteral(node, traverse) {
    var value = node.value

    if (node.template) {
      value = stringReferenceReplace(value)
    }

    return value
  },

  ListExpression: function listExpression(node, traverse) {
    return _.mapEach(node.elements, function (element) {
      return traverse(element, node)
    })
  },

  TopListExpression: function listExpression(node, traverse) {
    return [ _.mapEach(node.elements, function (element) {
      return traverse(element, node)
    }) ]
  },

  ExpressionStatement: function expressionStatement(node, traverse) {
    return traverse(node.expression)
  },

  BodyStatement: function bodyStatement(node, traverse) {
    return _.mapEach(node.body, function (element) {
      return traverse(element, node)
    })
  },

  BlockStatement: function blockStatement(node, traverse, memory) {
    var value = {}
    var left = traverse(node.left)
    var body = traverse(node.right)

    // refactor!!
    if (_.isArray(body) && node.operator === ':') {
      if (body.length === 1) {
        body = body[0]
      } else {
        var objBody = {}
        var hasPrimitive = false

        _.forEach(body, function (item) {
          if (hasPrimitive) return;
          if (_.isObject(item)) {
            _.forEach(item, function (subitem, key) {
              if (objBody.hasOwnProperty(key) && _.isObject(objBody[key])) {
                objBody[key] = [ objBody[key] ]
                objBody[key].push(subitem)
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
    }

    value[left.name] = createNode(node, {
      name: left.name,
      operator: node.operator,
      attributes: left.attributes,
      expression: left.expression,
      body: body
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
  },

  PipeStatement: function pipeStatement(node, traverse) {
    return traverse(node.body)
  },

  IdentifierExpression: function identifierExpression(node, traverse) {
    var attrsStore
    var attrs = node.attributes
    var name = traverse(node.id)
    var expr = traverse(node.expression)

    if (attrs) {
      attrsStore = _.mapEach(attrs, function (attribute) {
        return traverse(attribute, node)
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
  },

  Identifier: function identifier(node, traverse) {
    return node.name
  },

  ReferenceExpression: function referenceExpression(node, traverse) {
    return referenceStringTemplate(node.name)
  },

  AttributeExpression: function attributeExpression(node, traverse) {
    var value
    var identifier = traverse(node.left)
    var assignment = traverse(node.right)

    value = {
      name: identifier,
      value: assignment
    }

    return value
  },

  BinaryExpression: function binaryExpression(node, traverse) {
    var left = traverse(node.left)
    var right = traverse(node.right)

    return [ left, right ]
  },

  UnaryExpression: function unaryExpression(node, traverse) {
    var value = createNode(node, { value: traverse(node.argument, node) })

    switch (node.operator) {
      case '>':
      case '&':
        value.type = 'reference'
        value.visible = true
        break
      case '!>':
      case '!&':
        value.type = 'reference'
        value.visible = false
        break
      case '>>':
        value.type = 'clone'
        break
      case '>>>':
        value.type = 'extend'
        break
    }

    return value
  }
}

function createNode(astNode, obj) {
  if (astNode.loc) {
    obj.loc = astNode.loc
  }
  return obj
}

function stringReferenceReplace(value) {
  var alphanumeric = 'a-zA-Z0-9'
  var symbols = '\\-\\/\\\\\_\\^\\º\\¨\\ç\\¡\\¿\\.\\$\\@\\€\\?\\%\\+\\;"'
  var quotes = "\\'|" + '\\"'
  var pattern = new RegExp('\\*[\{|'+ quotes +']?(['+ alphanumeric + symbols +']+)[\}|'+ quotes +']?', 'gi')

  return value.replace(pattern, function (m, match) {
    return referenceStringTemplate(match)
  })
}

function referenceStringTemplate(str) {
  return '$$$' + str + '$$$'
}
