var Memory = require('./memory')
var postProcessor = require('./post-processor')
var _ = require('./helpers')
var walk = require('./walk')
var errors = require('./errors')

/**
 * hey! this is still a rudimentary beta implementation
 */

var memory = new Memory()

module.exports = Compiler

function Compiler(ast, options) {
  var result = []

  result = astWalk(ast.body)

  if (options && _.isObject(options.locals || options.data)) {
    memory.push(options.locals || options.data)
  }

  //console.log(require('util').inspect(ast, { depth: null }))

  if (result.length === 1) {
    result = result[0]
  }

  postProcessor(result, memory)

  //console.log(require('util').inspect(result, { depth: null }))

  return result
}

Compiler.prototype.defaults = {
  locals: null,
  data: null
}

function astWalk(ast, memory) {
  return _.mapEach(ast, function (node) {
    return traverse(node, ast)
  })
}

function traverse(node) {
  var val, type

  if (!_.isObject(node)) return;

  type = node.type

  switch (node.type) {
    case 'IntegerLiteral':
    case 'DecimalLiteral':
    case 'HexadecimalLiteral':
    case 'BooleanLiteral':
      val = node.value
      break
    case 'ExpressionStatement':
      val = traverse(node.expression)
      break
    default:
      if (processors.hasOwnProperty(type)) {
        val = processors[type](node)
      } else {
        throw new errors.CompileError('AST node type "' + type + '" is not supported')
      }
      break
  }

  return val
}

/**
 * AST node processors
 */

var processors = Compiler.prototype.processors = {

  StringLiteral: function stringLiteral(node) {
    var value = node.value

    if (node.template) {
      value = stringReferenceReplace(value)
    }

    return value
  },

  ListExpression: function listExpression(node) {
    return _.mapEach(node.elements, function (element) {
      return traverse(element, node)
    })
  },

  BodyStatement: function bodyStatement(node) {
    return _.mapEach(node.body, function (element) {
      return traverse(element, node)
    })
  },

  BlockStatement: function blockStatement(node) {
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

  ValueStatement: function valueStatement(node) {
    return processors.BlockStatement(node)
  },

  PipeStatement: function pipeStatement(node) {
    return traverse(node.body)
  },

  IdentifierExpression: function identifierExpression(node) {
    var attrsStore
    var attrs = node.attributes
    var name = traverse(node.id)
    var expr = traverse(node.expression)

    if (attrs && attrs.length) {
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

  Identifier: function identifier(node) {
    return node.name
  },

  ReferenceExpression: function referenceExpression(node) {
    return referenceStringTemplate(node.name)
  },

  AttributeExpression: function attributeExpression(node) {
    var value = {}
    var identifier = traverse(node.left)
    var assignment = traverse(node.right)

    value[identifier] = assignment

    return value
  },

  BinaryExpression: function binaryExpression(node) {
    var left = traverse(node.left)
    var right = traverse(node.right)

    return [ left, right ]
  },

  UnaryExpression: function unaryExpression(node) {
    var value = createNode(node, { value: traverse(node.argument, node) })

    switch (node.operator) {
      case '>':
      case '&':
        value.type = 'reference'
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
