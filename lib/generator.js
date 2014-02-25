'use strict'

var _ = require('./helpers')
var e = require('./errors')
var tokens = require('./tokens')

/**
 * Code generator
 * Pending major refactor
 */

var replacePattern = /[\$]{3}([^\${3}]*)[\$]{3}/g
var uniqueReferencePattern = /^[\$]{3}([^\${3}]*)[\$]{3}$/g
var EOL = /\n|\r|\r\n/

exports = module.exports = generator

function generator(obj, memory) {
  var result

  if (!_.canIterate(obj)) {
    return obj
  }

  result = mapReferences(
    findBlockReferences(obj, processBlockExpression),
    processStringReferences
  )

  if (_.isMutable(result)) {
    result = bodyNormalize(transformer(result))
  }

  return result

  function bodyNormalize(obj) {
    var tmp

    if (!_.canIterate(obj) || _.isObject(obj)) {
      return obj
    }

    if (_.isArray(obj)) {
      if (hasOnlyBlocks(obj)) {
        tmp = {}
        obj.forEach(function (node) {
          _.extendKeep(tmp, node)
        })
        obj = tmp
      } else if (obj.length === 1) {
        if (_.isArray(obj[0])) {
          obj = obj[0]
        }
      }
    }

    return obj
  }

  function hasOnlyBlocks(arr) {
    var has = true
    for (var i = 0, l = arr.length; i < l; i += 1) {
      if (!has) break;
      if (!_.isObject(arr[i])) {
        has = false
      }
    }
    return has
  }

  function hasMetaData(obj) {
    return _.has(obj, '$$body') || _.has(obj, '$$name')
  }

  function processBlockExpression(node) {
    var expr = node.$$expression
    if (_.isObject(expr)) {
      extendBlock(node, expr)
    } else if (_.isArray(expr)) {
      expr.forEach(function (ex) {
        extendBlock(node, ex)
      })
    }

    return node

    function extendBlock(node, expr) {
      var ref

      if (expr.type === 'extend' || expr.type === 'merge') {
        ref = fetchFromMemory(expr.value)

        if (!_.isMutable(ref)) {
          throw new e.TypeError('Cannot extend "' + node.$$name + '" block because "' + expr.value + '" reference is not a block')
        }
        if (!_.isMutable(node.$$body)) {
          throw new e.TypeError('Cannot extend "' + node.$$name + '" block with "' + expr.value + '": both must be blocks')
        }
        if (_.isType(node.$$body) !== _.isType(ref)) {
          throw new e.TypeError('Cannot extend "' + node.$$name + '" block with "' + expr.value + '": blocks types are mismatched')
        }

        switch (expr.type) {
          case 'extend':
            node.$$body = _.extend(_.clone(ref), node.$$body)
            break
          case 'merge':
            node.$$body = _.merge(_.clone(ref), node.$$body)
            break
        }
      }

      return node
    }
  }

  function transformer(obj) {
    var buf

    if (!_.isMutable(obj)) {
      return obj
    }

    if (_.isArray(obj)) {
      buf = processArray(obj)
    } else if (_.isObject(obj)) {
      buf = {}
      if (hasMetaData(obj)) {
        _.extendKeep(buf, processBlock(obj))
      } else {
        _.keys(obj).forEach(function (k) {
          var tmp, child = transformer(obj[k])
          if (_.isObject(child)) {
            _.extendKeep(buf, child)
          } else {
            buf[k] = child
          }
        })
      }
    }

    return buf
  }

  function processBlock(obj) {
    var attrStore
    var result = {}
    var body = obj.$$body
    var expr = obj.$$expression
    var attrs = obj.$$attributes
    var name = obj.$$name
    var keys = obj.$$duplicateKeys
    var alias = null
    var cur = result[name] = {}

    // pending refactor!
    if (expr) {
      if (_.isArray(expr)) {
        expr.forEach(function (expr) {
          if (expr.type === 'reference') {
            if (expr.visible) {
              alias = expr.value
              cur = cur[expr.value] = {}
            }
          }
        })
      } else {
        if (expr.type === 'reference') {
          if (expr.visible) {
            alias = expr.value
            cur = cur[expr.value] = {}
          }
        }
      }
    }

    if (attrs) {
      if (_.isArray(attrs)) {
        attrStore = {}
        attrs.forEach(function (attr) {
          if (attr.name) {
            attrStore[attr.name] = attr.value
          }
        })
      }
    }

    if (_.isObject(body)) {
      if (hasMetaData(body)) {
        body = processBlock(body)
      } else {
        if (keys) {
          keys.forEach(function (k) {
            var tmp = []
            if (_.isArray(body[k])) {
              body[k].forEach(function (node) {
                tmp.push(node.$$body)
              })
              body[k] = tmp
            }
          })
        }
        body = transformer(body)
      }
      if (alias) {
        if (attrStore) {
          result[name][alias]['$$attributes'] = attrStore
          result[name][alias]['$$body'] = body
        } else {
          result[name][alias] = body
        }
      } else {
        if (attrStore) {
          result[name]['$$attributes'] = attrStore
          result[name]['$$body'] = body
        } else {
          result[name] = body
        }
      }
    } else if (_.isArray(body)) {
      if (alias) {
        result[name][alias] = processArray(body)
        if (attrStore) {
          var tmp = {}
          tmp['$$body'] = result[name][alias]
          tmp['$$attributes'] = attrStore
          result[name][alias] = tmp
        }
      } else {
        result[name] = processArray(body)
        if (attrStore) {
          var tmp = {}
          tmp['$$body'] = result[name]
          tmp['$$attributes'] = attrStore
          result[name] = tmp
        }
      }
    } else {
      if (_.isString(body)) {
        body = processBodyString(body, obj.$$operator)
      }
      if (alias) {
        if (attrStore) {
          result[name][alias]['$$body'] = body
          result[name][alias]['$$attributes'] = attrStore
        } else {
          result[name][alias] = body
        }
      } else if (attrStore) {
        result[name]['$$attributes'] = attrStore
        result[name]['$$body'] = body
      } else {
        result[name] = body
      }
    }

    return result
  }

  function processBodyString(str, operator) {
    switch (operator) {
      case tokens.ASSIGN_UNFOLD:
        str = str.replace(/^\s+|\s+$/g, '')
        break
      case tokens.ASSIGN_FOLD:
        str = str.replace(/\n|\r\n/g, '').replace(/\s+/g, ' ')
        break
      default:
        str = str
        break
    }
    return str
  }

  function processArray(arr) {
    var buf = arr.map(transformer)

    if (buf.length === 1) {
      if (_.isArray(buf[0]) && buf[0].length === 1) {
        buf = buf[0]
      }
    }

    return buf
  }

  function findBlockReferences(obj, cb) {
    if (_.canIterate(obj)) {
      walker(obj)
    }

    function walker(obj, parent) {
      var i, l, key, node
      var isArr = _.isArray(obj)
      var keys = _.keys(obj)
      parent = parent || obj

      if (!keys.length) return;

      for (i = 0, l = keys.length; i < l; i += 1) {
        key = keys[i]
        node = obj[key]

        if (!_.canIterate(node)) {
          continue
        }

        if (_.isObject(node)) {
          if (hasMetaData(node)) {
            if (isArr) {
              obj[i] = cb(node, obj)
            } else {
              obj[key] = cb(node, obj)
            }
          }
        }

        walker(node, parent)
      }
    }

    return obj
  }

  function mapReferences(obj, cb) {
    if (_.canIterate(obj)) {
      walker(obj)
    }

    function walker(obj) { // not chuck norris
      var i, l, key, node
      var isArr = _.isArray(obj)
      var keys = _.keys(obj)

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

  function processStringReferences(str) {
    if (hasOnlyReference(str)) {
      str = fetchFromMemory(removeDollars(str))
    } else {
      var match = str.match(replacePattern)

      if (match) {
        _.forEach(match, function (ref) {
          var data = fetchFromMemory(removeDollars(ref))

          if (_.isMutable(data)) {
            throw new e.TypeError('Interpolated strings references cannot point to blocks: ' + removeDollars(ref))
          }

          str = str.replace(ref, String(data))
        })
      }
    }

    return str

    function hasOnlyReference(str) {
      return uniqueReferencePattern.test(str)
    }
  }

  function fetchFromMemory(ref) {
    var data = memory.fetch(ref)
    if (data === undefined) {
      throw new e.ReferenceError(ref)
    }
    if (isNestedRef(ref) && hasMetaData(data)) {
      data = data.$$body
    }
    return data
  }

  function processStringInterpolated(str) {
    return str.replace(replacePattern, function (m, ref) {
      return fetchFromMemory(ref)
    })
  }

  function removeDollars(str) {
    return str.replace(/^\${3}/g, '').replace(/\${3}$/g, '')
  }

  function isReferenceBlock(expr, key) {
    return _.isObject(expr)
      && expr.type === 'reference'
      && expr.value !== key
      && expr.visible
  }

  function isNestedRef(ref) {
    return ref.indexOf('.') !== -1
  }

}
