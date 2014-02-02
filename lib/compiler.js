var _ = require('./helpers')
var walk = require('./walk')

module.exports = function compile(ast) {
  var node;
  for (var i = 0, l = ast.length; i < l; i += 1) {
    node = ast[i]
    if (_.isArray(node)) return;

    walk(node)(traversal);
  }
}

function traversal(node, parent) {
  console.log(node);
  switch (node.type) {
    case 'asdasd':

    break;
  }
}

function visitor() {
  // node visitor
}

function generator() {

}
