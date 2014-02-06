var Memory = require('./memory')
var _ = require('./helpers')
var walk = require('./walk')
var travesal = require('./traverse')

/**
 * hey! this is still a rudimentary beta implementation
 */

var memory = new Memory()

module.exports = function Compiler(ast, options) {
  var result = []

  result = astWalk(ast.body)

  //console.log(require('util').inspect(ast, { depth: null, loc: true }))

  if (result.length === 1) {
    result = result[0]
  }

  mapStrings(result, function (string) {
    return string.replace(/\$\$\$(.*)\$\$\$/g, function (m, ref) {
      return memory.fetch(ref)
    })
  })

  //console.log(require('util').inspect(result, { depth: null, loc: true }))

  return result
}

/**
 * Post-processor
 */

function mapStrings(obj, cb) {

  if (_.canIterate(obj)) {
    walker(obj)
  }

  function walker(obj) {
    var i, l, key, node
    var isArr = _.isArray(obj)
    var keys = _.objKeys(obj)

    if (!keys.length) return;

    for (i = 0, l = keys.length; i < l; i += 1) {
      key = keys[i]
      node = obj[key]
      if (typeof node == 'string') {
        if (isArr) {
          obj[i] = cb(node)
        } else {
          obj[key] = cb(node)
        }
      } else if (_.canIterate(node)) {
        walker(node)
      }
    }
  }

  return obj
}

function astWalk(ast) {
  var i, l, node
  var result = []
  var length = _.isArray(ast) ? ast.length : _.objKeys(ast).length

  for (i = 0, l = length; i < l; i += 1) {
    node = ast[i]
    result.push(traverse(node, ast))
  }

  return result
}

function traverse(node, parent) {
  var val

  if (!node) return null;

  node.parent=parent

  switch (node.type) {
    case 'StringLiteral':
      val = processor.StringLiteral(node, parent)
      break
    case 'IntegerLiteral':
      val = node.value
      break
    case 'DecimalLiteral':
      val = node.value
      break
    case 'HexadecimalLiteral':
      val = node.value
      break
    case 'BooleanLiteral':
      val = node.value
      break
    case 'ListExpression':
      val = processor.ListExpression(node, parent)
      break
    case 'ExpressionStatement':
      val = traverse(node.expression, node)
      break
    case 'ValueStatement':
      val = processor.ValueStatement(node, parent)
      break
    case 'BlockStatement':
      val = processor.BlockStatement(node, parent)
      break
    case 'BodyStatement':
      val = processor.BodyStatement(node, parent)
      break
    case 'PipeStatement':
      val = processor.PipeStatement(node, parent)
      break
    case 'IdentifierExpression':
      val = processor.IdentifierExpression(node, parent)
      break
    case 'Identifier':
      val = processor.Identifier(node, parent)
      break
    case 'ReferenceExpression':
      val = processor.ReferenceExpression(node, parent)
      break
    case 'AttributeExpression':
      val = processor.AttributeExpression(node, parent)
      break
    case 'UnaryExpression':
      val = processor.UnaryExpression(node,parent)
      break
    case 'BinaryExpression':
      val = processor.BinaryExpression(node,parent)
      break
  }

  return val
}

/**
 * Pre-processors
 */

var processor = {

  StringLiteral: function stringLiteral(node, parent) {
    var value = node.value

    if (node.template) {
      value = stringReferenceReplace(value)
    }

    return value
  },

  ListExpression: function listExpression(node, parent) {
    var elements = []

    _.forEach(node.elements, function (element) {
      elements.push(traverse(element, node))
    })

    return elements
  },

  BodyStatement: function bodyStatement(node, parent) {
    var elements = []

    _.forEach(node.body, function (element) {
      elements.push(traverse(element, node))
    })

    return elements
  },

  BlockStatement: function blockStatement(node, parent) {
    var left = traverse(node.left, parent)
    var right = traverse(node.right, parent)
    var value = {}

    value[left.name] = {
      attributes: left.attributes,
      expression: left.expression,
      body: right
    }

    return value
  },

  ValueStatement: function valueStatement(node, parent) {
    var value = {}
    var left = traverse(node.left)
    var right = traverse(node.right)

    value[left.name] = {
      attributes: left.attributes,
      expression: left.expression,
      body: right
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

  PipeStatement: function pipeStatement(node, parent) {
    return traverse(node.body, parent)
  },

  IdentifierExpression: function identifierExpression(node, parent) {
    var attrsStore = []
    var name = traverse(node.id, node)
    var attrs = node.attributes
    var expr = traverse(node.expression)

    if (attrs && attrs.length) {
      _.forEach(attrs, function (attribute) {
        attrsStore.push(traverse(attribute, node))
      })
    }

    var value = {
      name: name,
      attributes: attrsStore,
      expression: expr
    }

    return value
  },

  Identifier: function identifier(node, parent) {
    return node.name
  },

  ReferenceExpression: function referenceExpression(node, parent) {
    return referenceStringTemplate(node.name)
  },

  AttributeExpression: function attributeExpression(node, parent) {
    var value = {}
    var identifier = traverse(node.left)
    var assignment = traverse(node.right)

    value[identifier] = assignment || null

    return value
  },

  BinaryExpression: function binaryExpression(node, parent) {
    var left = traverse(node.left)
    var right = traverse(node.right)

    return [ left, right ]
  },

  UnaryExpression: function unaryExpression(node, parent) {
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
