'use strict'

var _ = require('./helpers')
var e = require('./errors')
var tokens = require('./tokens')

var replacePattern = /[\$]{3}([^\${3}]*)[\$]{3}/g
var uniqueReferencePattern = /^[\$]{3}([^\${3}]*)[\$]{3}$/g
var EOL = /\n|\r|\r\n/

exports = module.exports = generator

function generator(obj, memory) {

  return normalize(
    generate(
      processReferences(
        processBlockExpressions(obj)
      )
    )
  )

  function processBlockExpressions(obj) {
    return findBlockReferences(obj, function (node) {
      var expr = node.$$expression
      if (_.isObject(expr)) {
        extendBlock(node, expr)
      } else if (_.isArray(expr)) {
        expr.forEach(function (ex) {
          extendBlock(node, ex)
        })
      }
      return node
    })
  }

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

      ref = _.clone(ref)
      switch (expr.type) {
        case 'extend':
          node.$$body = _.extend(ref, node.$$body)
          break
        case 'merge':
          node.$$body = _.merge(ref, node.$$body)
          break
      }
    }

    return node
  }

  function generate(obj) {
    switch (_.isType(obj)) {
      case 'array':
        obj = processArray(obj)
        break
      case 'object':
        if (hasMetaData(obj)) {
          obj = processBlock(obj)
        } else {
          obj = generatePlainBlock(obj)
        }
        break
    }
    return obj
  }

  function generatePlainBlock(obj) {
    var k, child
    var buf = {}
    for (k in obj) {
      if (_.has(obj, k)) {
        child = generate(obj[k])
        if (_.isObject(child)) {
          _.extendKeep(buf, child)
        } else {
          buf[k] = child
        }
      }
    }
    return buf
  }

  function blockAttributes(attrs) {
    var store = {}
    if (_.isArray(attrs) && attrs) {
      attrs.forEach(function (attr) {
        if (attr.name) {
          store[attr.name] = attr.value
        }
      })
    }
    return store
  }

  function blockReference(expr, block) {
    var alias
    if (!_.isArray(expr)) {
      expr = [ expr ]
    }
    expr.forEach(function (expr) {
      if (expr.type === 'reference') {
        if (expr.visible) {
          alias = expr.value
        }
      }
    })
    return alias
  }

  function blockResult(result, name) {
    return function (key, value, alias) {
      var ref = result[name]
      if (key === 'body') {
        if (alias) {
          result[name][alias] = value
        } else {
          result[name] = value
        }
      } else {
        if (alias) {
          if (!_.isObject(result[name][alias])) {
            result[name][alias] = {}
          }
          ref = result[name][alias]
        }
        ref[key] = value
      }
    }
  }

  function blockKeys(body, keys) {
    keys.forEach(function (k) {
      var buf = []
      if (_.isArray(body[k])) {
        body[k].forEach(function (node) {
          buf.push(node.$$body)
        })
        body[k] = buf
      }
    })
  }

  function blockBody(obj) {
    var body = obj.$$body
    var keys = obj.$$duplicateKeys

    if (_.isObject(body)) {
      if (hasMetaData(body)) {
        body = processBlock(body)
      } else {
        if (keys) {
          blockKeys(body, keys)
        }
        body = generate(body)
      }
    } else if (_.isArray(body)) {
      body = processArray(body)
    } else if (_.isString(body)) {
      body = processString(body, obj.$$operator)
    }

    return body
  }

  function processBlock(obj) {
    var result = {}
    var expr = obj.$$expression
    var attrs = obj.$$attributes
    var name = obj.$$name
    var alias = null
    var setResult = blockResult(result, name)

    var body = blockBody(obj)
    result[name] = {}

    if (expr) {
      alias = blockReference(expr)
    }
    if (attrs) {
      attrs = blockAttributes(attrs)
      setResult('$$attributes', attrs, alias)
      setResult('$$body', body, alias)
    } else {
      setResult('body', body, alias)
    }

    return result
  }

  function processString(str, operator) {
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
    var buf = arr.map(generate)
    if (buf.length === 1) {
      if (_.isArray(buf[0]) && buf[0].length === 1) {
        buf = buf[0]
      }
    }
    return buf
  }

  function findBlockReferences(obj, cb) {
    if (_.canIterate(obj)) {
      walk(obj)
    }

    function walk(obj, parent) {
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
        walk(node, parent)
      }
    }

    return obj
  }

  function processReferences(obj) {
    return mapReferences(obj)

    function mapReferences(obj) {
      if (_.canIterate(obj)) {
        walk(obj, processStringReferences)
      }

      function walk(obj, cb) { // not chuck norris
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
            walk(node, processStringReferences)
          }
        }
      }

      return obj
    }

    function processStringReferences(str) {
      var match
      if (hasOnlyReference(str)) {
        str = fetchFromMemory(removeDollars(str))
      } else {
        match = str.match(replacePattern)
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

}

//
// Helpers
//

function normalize(obj) {
  var tmp, k
  if (_.isArray(obj)) {
    if (hasOnlyBlocks(obj)) {
      tmp = {}
      for (k in obj) {
        if (_.has(obj, k)) {
          _.extendKeep(tmp, obj[k])
        }
      }
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

function hasOnlyReference(str) {
  return uniqueReferencePattern.test(str)
}

function hasMetaData(obj) {
  return _.has(obj, '$$body') || _.has(obj, '$$name')
}

function processStringInterpolated(str) {
  return str.replace(replacePattern, function (m, ref) {
    return fetchFromMemory(ref)
  })
}

function removeDollars(str) {
  return str
    .replace(/^\${3}/g, '')
    .replace(/\${3}$/g, '')
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
