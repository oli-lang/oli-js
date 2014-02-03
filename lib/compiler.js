var _ = require('./helpers')
var walk = require('./walk')

module.exports = function compile(ast) {
  var node, result = []
  ast = ast.body

  for (var i = 0, l = ast.length; i < l; i += 1) {
    node = ast[i]
    if (_.isArray(node)) return;
    walk(node)(traversal)
  }

  function traversal(node, parent) {
    switch (node.type) {
      case 'StringLiteral':
        result.push(node.value)
      break
      case 'IntegerLiteral':
        result.push(node.value)
      break
      case 'DecimalLiteral':
        result.push(node.value)
      break
      case 'HexadecimalLiteral':
        result.push(node.value)
      break
      case 'BooleanLiteral':
        result.push(node.value)
      break
    }
  }

  if (result.length === 1) {
    result = result[0]
  }

  return result
}

function visitor() {
  // node visitor
}

function generator() {

}
