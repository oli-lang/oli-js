var Memory = require('./memory')
var postProcessor = require('./post-processor')
var _ = require('./helpers')
var walk = require('./walk')
var travesal = require('./traverse')
var errors = require('./errors')

/**
 * hey! this is still a rudimentary beta implementation
 */

var memory = new Memory()

module.exports = function compiler(ast, options) {
  var result = []

  result = astWalk(ast.body)

  if (options && _.isObject(options.locals || options.data)) {
    memory.push(options.locals || options.data)
  }

  //console.log(require('util').inspect(ast, { depth: null, loc: true }))

  if (result.length === 1) {
    result = result[0]
  }

  postProcessor(result, memory)

  //console.log(require('util').inspect(result, { depth: null, loc: true }))

  return result
}


function astWalk(ast) {
  var i, l, node
  var result = []
  var length = _.isArray(ast) ? ast.length : _.objKeys(ast).length

  result = _.mapEach(ast, function (node) {
    return traverse(node, ast)
  })

  return result
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
      if (processor.hasOwnProperty(type)) {
        val = processor[type](node)
      }
      break
  }

  return val
}

/**
 * AST transform
 */

var processor = {

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
    var left = traverse(node.left)
    var body = traverse(node.right)
    var value = {}

    value[left.name] = {
      attributes: left.attributes,
      expression: left.expression,
      body: body
    }

    return value
  },

  ValueStatement: function valueStatement(node) {
    var value = {}
    var left = traverse(node.left)
    var body = traverse(node.right)

    value[left.name] = {
      attributes: left.attributes,
      expression: left.expression,
      body: body
    }

    if (left.expression !== null) {
      _.forEach(left.expression, function (node) {
        if (node.type === 'reference') {
          memory.allocate(node.value, right)
        }
      })
    }

    return value
  },

  PipeStatement: function pipeStatement(node) {
    return traverse(node.body)
  },

  IdentifierExpression: function identifierExpression(node) {
    var attrsStore
    var attrs = node.attributes
    var name = traverse(node.id, node)
    var expr = traverse(node.expression)

    if (attrs && attrs.length) {
      attrsStore = _.mapEach(attrs, function (attribute) {
        return traverse(attribute, node)
      })
    }

    var value = {
      name: name,
      attributes: attrsStore,
      expression: expr
    }

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
    var value = { value: traverse(node.argument, node) }

    switch (node.operator) {
      case '>':
        value.type = 'reference'
        break
      case '!>':
        value.type = 'reference'
        value.visible = true
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
