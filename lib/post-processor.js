var _ = require('./helpers')
var errors = require('./errors')

var replacePattern = /[\$]{3}([^\${3}]*)[\$]{3}/g

module.exports = PostProcessor

function PostProcessor(result, memory) {

  result = _.cleanUndefined(result)

  result = processBlockExpressions(result)

  result = mapReferences(result, function (str) {
    str = processStringReferences(str)
    if (_.isString(str)) {
      str = processStringInterpolated(str)
    }
    return str
  })

  return result

  function processBlockExpressions(obj) {
    return mapBlockNodes(obj, function (node, name, parent) {
      var expr = node.expression

      if (_.isArray(expr)) {
        _.forEach(expr, function (item) {
          if (item) {
            node = extendObject(node, item)
          }
        })
      } else if (_.isObject(expr)) {
        node = extendObject(node, expr)
      }

      return node
    })

    function extendObject(node, item) {
      switch (item.type) {
        case 'extend':
          var ref = fetchFromMemory(item.value)

          if (!_.isMutable(ref)) {
            throw new errors.TypeError('Cannot extend: "' + item.value + '" reference is not a block')
          }
          if (!_.isObject(node.body)) {
            throw new errors.TypeError('Cannot extend "' + node.name + '" with "' + item.value + '": both must be objects')
          }

          node.body = _.extend(_.clone(ref), node.body)
          break
        case 'merge':
          node.body = _.extend(_.clone(ref), node.body)
          break
      }

      return node
    }
  }

  function processStringReferences(str) {
    var data, match = str.match(replacePattern)

    if (match && match.length > 1) {
      if (data = fetchFromMemory(match[1])) {
        if (_.isMutable(data)) {
          str = data
        }
      }
    }

    return str
  }

  function processStringInterpolated(str) {
    // replace interpolated values reference
    return str.replace(replacePattern, function (m, ref) {
      return fetchFromMemory(ref)
    })
  }

  function mapBlockNodes(obj, cb) {
    _.forEach(obj, function (node, name) {
      if (_.isArray(node)) {
        return mapBlockNodes(node, cb)
      } else if (_.isObject(node)) {
        if (!node.body) {
          return mapBlockNodes(node, cb)
        }
        obj = cb(node, name, obj)
      }
    })
    return obj
  }

  function fetchFromMemory(ref) {
    var data = memory.fetch(ref)
    if (data === undefined) {
      throw new errors.ReferenceError(ref)
    }
    return data
  }

}

function mapReferences(obj, cb) {

  if (_.canIterate(obj)) {
    walker(obj)
  }

  function walker(obj) { // not chuck norris
    var i, l, key, node
    var isArr = _.isArray(obj)
    var keys = _.objKeys(obj)

    if (!keys.length) return;

    for (i = 0, l = keys.length; i < l; i += 1) {
      key = keys[i]
      node = obj[key]
      if (typeof node === 'string') {
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
