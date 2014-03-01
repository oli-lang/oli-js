'use strict'

/**
 * Hey! this is still a rudimentary implementation
 * until the language specification is closed
 * It will be fully redesigned as a part of the compiler in a inminent future version
 */

var _ = require('./helpers')
var e = require('./errors')
var tokens = require('./tokens')

var replacePattern = /[\@]{3}([^\@{3}]*)[\@]{3}/g
var uniqueReferencePattern = /^[\@]{3}([^\@{3}]*)[\@]{3}$/

exports = module.exports = generator

function generator(obj, memory) {

  return normalize(
    generate(
      transformReferences(obj)
    )
  )

  function transformReferences(obj) {
    return processReferences(
      processBlockReferences(obj)
    )
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

  //
  // Code generators
  //

  function generate(obj) {
    switch (_.isType(obj)) {
      case 'array':
        obj = generateList(obj)
        break
      case 'object':
        if (hasMetaData(obj)) {
          obj = generateBlock(obj)
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

  function blockReference(expr) {
    var alias
    if (!_.isArray(expr)) {
      expr = [ expr ]
    }
    expr.forEach(function (expr) {
      if (expr.type === 'alias') {
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

    switch (_.isType(body)) {
      case 'object':
        if (hasMetaData(body)) {
          body = generateBlock(body)
        } else {
          if (keys) {
            blockKeys(body, keys)
          }
          body = generate(body)
        }
        break
      case 'array':
        body = generateList(body)
        break
      case 'string':
        body = generateString(body, obj.$$operator)
        break
    }

    return body
  }

  function generateBlock(obj) {
    var result = {}
    var alias = null
    var expr = obj.$$expression
    var attrs = obj.$$attributes
    var name = obj.$$name
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

  function generateString(str, operator) {
    switch (operator) {
      case tokens.ASSIGN_UNFOLD:
        str = str.replace(/^\s+|\s+$/g, '')
        break
      case tokens.ASSIGN_FOLD:
        str = str.replace(_.EOL, '').replace(/\s+/g, ' ')
        break
    }
    return str
  }

  function generateList(arr) {
    var buf = arr.map(generate)
    if (buf.length === 1) {
      if (_.isArray(buf[0]) && buf[0].length === 1) {
        buf = buf[0]
      }
    }
    return buf
  }

  //
  // References
  //

  function processReferences(obj) {
    if (_.canIterate(obj)) {
      walk(obj, replaceReferences)
    }

    function walk(obj, cb) {
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
          walk(node, replaceReferences)
        }
      }
    }

    return obj
  }

  function replaceReferences(str) {
    var matches, count = 1
    while (matches = matchReferences(str)) {
      str = replaceReferences(str, matches)
      if (count > 1000) {
        throw new e.CompileError('Circular reference detected')
      }
      count += 1
    }

    return str

    function matchReferences(str) {
      if (_.isString(str)) {
        return str.match(replacePattern)
      }
    }

    function replaceReferences(str, matches) {
      matches.forEach(function (ref) {
        var name = removeReferencesChars(ref)
        var data = fetchFromMemory(name)
        if (isUniqueReference(str)) {
          str = data
        } else {
          if (_.isMutable(data)) {
            throw new e.TypeError('Interpolated strings references cannot point to blocks: ' + name)
          }
          str = str.replace(ref, data)
        }
      })
      return str
    }
  }

  //
  // Blocks
  //

  function processBlockReferences(obj) {
    return findBlockReferences(obj, function (node) {
      var expr = node.$$expression
      if (_.isObject(expr)) {
        mutateBlock(node, expr)
      } else if (_.isArray(expr)) {
        expr.forEach(function (ex) {
          mutateBlock(node, ex)
        })
      }
      return node
    })
  }

  function mutateBlock(node, expr) {
    var ref
    var type = expr.type

    if (type === 'extend' || type === 'merge') {
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
      if (type === 'extend'){
        node.$$body = _.extend(ref, node.$$body)
      } else if (type === 'merge') {
        node.$$body = _.merge(ref, node.$$body)
      }
    }

    return node
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

function isUniqueReference(str) {
  return uniqueReferencePattern.test(str)
}

function hasMetaData(obj) {
  return _.has(obj, '$$body') || _.has(obj, '$$name')
}

function removeReferencesChars(str) {
  return str
    .replace(/^\@{3}/g, '')
    .replace(/\@{3}$/g, '')
}

function isNestedRef(ref) {
  return ref.indexOf('.') !== -1
}
