var _ = require('./helpers')
var errors = require('./errors')

/**
 * Compilation result code generator
 * Pending refactor
 */

var replacePattern = /[\$]{3}([^\${3}]*)[\$]{3}/g

exports = module.exports = generator

function generator(obj, memory) {

  if (!_.isMutable(obj)) {
    return obj
  }

  var result = _.cleanUndefined(obj)

  result = processBlockExpressions(result)

  result = mapReferences(result, function (str) {
    return processStringReferences(str)
  })

  if (_.isMutable(result)) {
    result = resultTranformer(result)
  }

  return result

  //
  // REFACTOR IN PROGRESS!
  //

  function resultTranformer(obj) {
    var result
    var hasPrimitives = false

    if (_.isArray(obj)) {
      _.forEach(obj, function (node, key) {
        if (hasPrimitives) return;
        if (!_.isMutable(node)) {
          result = obj
          return hasPrimitives = true
        }
        if (_.isArray(node)) {
          result = resultArray(node)
        } else if (_.isObject(node)) {
          result = _.merge(result, normalizeNode(node))
        }
      })
    } else {
      result = {}
      result[obj.name] = nodeTemplate(obj)
    }

    return result

    function resultArray(node) {
      return _.mapEach(node, function (snode, skey) {
        if (_.canIterate(snode)) {
          snode = resultTranformer(snode)
        }
        return snode
      })
    }

    function normalizeNode(obj) {
      var node = {}

      _.forEach(obj, function (el, key) {
        if (_.isObject(el)) {
          if (el.attributes == null && el.expression == null) {
            node[key] = el.body
          } else {
            if (isReferenceBlock(el.expression, key)) {
              if (!node.hasOwnProperty(key)) {
                node[key] = {}
              }
              if (el.attributes) {
                node[key][el.expression.value] = buildMetaObject(el)
              } else {
                node[key][el.expression.value] = el.body
              }
            } else if (el.attributes) {
              node[key] = buildMetaObject(el)
            } else {
              node[key] = el.body
            }
          }
        }
      })

      return node
    }
  }

  function nodeTemplate(node) {
    if (isReferenceBlock(node.expression)) {
      if (node.attributes) {
        node = buildMetaObject(node)
      } else {
        node = node.body
      }
    } else if (node.attributes) {
      node = buildMetaObject(node)
    } else {
      node = node.body
    }
    return node
  }

  function isReferenceBlock(expr, key) {
    return _.isObject(expr) && expr.type === 'reference' && expr.value !== key && expr.visible
  }

  function buildMetaObject(el) {
    return {
      '@attributes': el.attributes,
      '@body': el.body
    }
  }

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
      var ref

      switch (item.type) {
        case 'extend':
          ref = fetchFromMemory(item.value)

          if (!_.isMutable(ref)) {
            throw new errors.TypeError('Cannot extend: "' + item.value + '" reference is not a block')
          }
          if (!_.isObject(node.body)) {
            throw new errors.TypeError('Cannot extend "' + node.name + '" with "' + item.value + '": both must be objects')
          }

          node.body = _.extend(_.clone(ref), node.body)
          break
        case 'merge':
          node.body = _.merge(_.clone(ref), node.body)
          break
      }

      return node
    }
  }

  function processStringReferences(str) {
    var match = str.match(replacePattern)

    if (match) {
      _.forEach(match, function (ref) {
        var data = fetchFromMemory(removeDollars(ref))
        str = str.replace(ref, data)
        if (_.isMutable(data) && match.length > 1) {
          throw errors.CompileError('Interpolated strings references cannot be a block: ' + ref)
        }
      })
    }

    return str
  }

  function processStringInterpolated(str) {
    return str.replace(replacePattern, function (m, ref) {
      return fetchFromMemory(ref)
    })
  }

  function removeDollars(str) {
    return str.replace(/^\${3}/g, '').replace(/\${3}$/g, '')
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
