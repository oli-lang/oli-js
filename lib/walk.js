var _ = require('./helpers')

module.exports = function(ast) {
  return function(cb) {
    walk(ast, undefined, cb);
  };
};

function walk(node, parent, cb) {
  var keys = _.objKeys(node);
  for (var i = 0, l = keys.length; i < l; i += 1) {
    var key = keys[i];
    if (key === 'parent') continue;

    var child = node[key];
    if (_.isArray(child)) {
      for (var j = 0, cl = child.length; j < cl; j++) {
        var c = child[j];
        if (c && typeof c.type === 'string') {
          c.parent = node;
          walk(c, node, cb);
        }
      }
    } else if (child && typeof child.type === 'string') {
      child.parent = node;
      walk(child, node, cb);
    }
  }
  cb(node);
}
