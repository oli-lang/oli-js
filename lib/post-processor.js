var _ = require('./helpers')
var errors = require('./errors')

module.exports = function postProcessor(result, memory) {

  // replace interpolated values reference in strings
  mapStrings(result, function (str) {
    return str.replace(/\$\$\$(.*)\$\$\$/g, function (m, ref) {
      return fetchFromMemory(ref)
    })
  })

  function fetchFromMemory(ref) {
    var data = memory.fetch(ref)
    if (data === undefined) {
      throw new errors.ReferenceError(ref)
    }
  }
}

function mapStrings(obj, cb) {

  if (_.canIterate(obj)) {
    walker(obj)
  }

  function walker(obj) { // like chuck norris, but recursive!
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
