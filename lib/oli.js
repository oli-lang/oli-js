var traverse = require('./traverse')

module.exports = Oli

function Oli(code, options) {
  Oli.parse(code, options)
}

Oli.parse = function (code, options) {
  var node, current, result = {}
  var ast = Oli.ast(code, options)

  if (!ast) {
    return '';
  }
  if (!ast.body.length) {
    return '';
  }

  ast = ast.body;

  for (var i = 0, l = ast.length; i < l; i += 1) {
    node = ast[i]
    if (Array.isArray(node)) return;
    if (node.type === 'ValueBlockStatement') {
      current = result[node.id.name] = [];

      traverse(node.body).forEach(function (body) {
        if (this.isLeaf) return;
        if (body.type === 'StringLiteral') {
          current.push(body.value)
        }
      });
    }
  }

  return result;
}

Oli.ast = function (code, options) {
  var parser

  if (code == null) {
    return null
  }
  if (options == null) {
    options = { loc: true }
  }

  return require('./parser').parse(code)
}

Oli.tokens = function (code, options) {
  return traverse.nodes(Oli.ast(code, options))
}

