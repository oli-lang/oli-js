'use strict'

var _ = require('./helpers')

exports = module.exports = function(ast) {
  return function(cb) {
    walk(ast, undefined, cb)
  };
};

function walk(node, parent, cb) {
  var i, l, j, cl, c, keys, key, child

  if (!_.canIterate(node)) {
    return cb(node, parent)
  }

  if (!_.isArray(node)) {
    cb(node, parent)
  }

  keys = _.keys(node)

  for (i = 0, l = keys.length; i < l; i += 1) {
    key = keys[i]
    if (key === 'parent') continue;

    child = node[key]
    if (_.isArray(child)) {
      for (j = 0, cl = child.length; j < cl; j += 1) {
        c = child[j]
        if (c) {
          c.parent = node
          walk(c, node, cb)
        }
      }
    } else if (child) {
      child.parent = node
      walk(child, node, cb)
    }
  }
}
