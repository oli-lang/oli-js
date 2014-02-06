var _ = require('./helpers')

module.exports = function(ast) {
  return function(cb) {
    walk(ast, undefined, cb);
  };
};

function walk(node, parent, cb) {
  if (!_.isObject(node) && !_.isArray(node)) {
    return cb(node, parent)
  }

  // reverse callback
  if (!_.isArray(node)) {
    cb(node, parent)
  }

  var keys = _.objKeys(node)

  for (var i = 0, l = keys.length; i < l; i += 1) {
    var key = keys[i];
    if (key === 'parent') continue;

    var child = node[key];
    if (_.isArray(child)) {
      for (var j = 0, cl = child.length; j < cl; j++) {
        var c = child[j];
        if (c) {
          c.parent = node;
          walk(c, node, cb);
        }
      }
    } else if (child) {
      child.parent = node;
      walk(child, node, cb);
    }
  }
}
