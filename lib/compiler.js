var _ = require('./helpers')
var walk = require('./walk')

module.exports = function compile(ast) {
  var node;
  for (var i = 0, l = ast.length; i < l; i += 1) {
    node = ast[i]
    if (_.isArray(node)) return;

    walk(node)(function (node, parent) {
      //console.log('>>', node)
    });
  }
}

function buffer() {

}
