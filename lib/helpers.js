'use strict'

var toString = Object.prototype.toString
var hasOwn = Object.prototype.hasOwnProperty
var hasConsole = console && console.log
var isBrowser = typeof window !== 'undefined'

var _ = exports = module.exports = {}

_.isBrowser = isBrowser

_.isBoolean = function (obj) {
  return typeof obj === 'boolean'
}

_.isNumber = function (obj) {
  return typeof obj === 'number'
}

_.isDate = function (obj) {
  return toS(obj) === '[object Date]'
}

_.isError = function (obj) {
  return toS(obj) === '[object Error]'
}

_.isString = function (obj) {
  return toS(obj) === '[object String]'
}

_.isArray = Array.isArray || function (obj) {
  return toS(obj) === '[object Array]'
}

_.isObject = function (obj) {
  return toS(obj) === '[object Object]'
}

_.isMutable = function (obj) {
  return _.isObject(obj) || _.isArray(obj) || _.isDate(obj)
}

_.isType = function (obj) {
  var type
  if (_.isArray(obj)) {
    type = 'array'
  } else if (_.isObject(obj)) {
    type = 'object'
  } else if (obj === null) {
    type = 'null'
  } else {
    type = typeof obj
  }
  return type
}

_.canIterate = function (obj) {
  return _.isObject(obj) || _.isArray(obj)
}

_.has = function (obj, prop) {
  return hasOwn.call(obj, prop)
}

_.walk = function (obj, cb) {
  walk(obj, undefined, cb)
}

_.forEach = function (obj, fn) {
  var i, item, keys, length

  if (!obj) return;

  if (typeof obj.forEach === 'function') {
    obj.forEach(fn)
  } else {
    if (_.isObject(obj)) {
      keys = _.keys(obj)
      length = keys.length
      for (i = 0; i < length; i += 1) {
        item = obj[keys[i]]
        fn(item, keys[i], obj)
      }
    } else {
      length = obj.length
      for (i = 0; i < length; i += 1) {
        item = obj[i]
        fn(item, i, obj)
      }
    }
  }
}

_.mapEach = function (obj, fn) {
  var i, el, length, results = []

  if (!obj) return;

  if (_.isObject(obj)) {
    length = _.keys(obj).length
  } else {
    length = obj.length
  }

  for (i = 0; i < length; i += 1) {
    el = fn(obj[i], i, obj)
    if (el != null) {
      results.push(el)
    }
  }

  return results
}

_.extend = function (target, origin) {
  var prop
  target = target || {}

  if (!_.isObject(origin)) return target;

  for (prop in origin) {
    if (_.has(origin, prop)) {
      target[prop] = origin[prop]
    }
  }

  return target
}

_.extendKeep = function (target, origin) {
  var prop
  target = target || {}

  if (!_.isObject(origin)) return target;

  for (prop in origin) {
    if (_.has(origin, prop)) {
      if (_.has(target, prop)) {
        if (!_.isArray(target[prop])) {
          target[prop] = target[prop] != null ? [ target[prop] ] : []
        }
        target[prop].push(origin[prop])
      } else {
        target[prop] = origin[prop]
      }
    }
  }

  return target
}

_.merge = function merge(target, src) {
  var array = _.isArray(src)
  var dst = array && [] || {}

  if (array) {
    target = target || []
    dst = dst.concat(target)
    src.forEach(function (e, i) {
      if (typeof target[i] === 'undefined') {
        dst[i] = e
      } else if (_.isMutable(e)) {
        dst[i] = merge(target[i], e)
      } else {
        if (target.indexOf(e) === -1) {
          dst.push(e)
        }
      }
    })
  } else {
    if (target && _.isMutable(target)) {
      _.keys(target).forEach(function (key) {
        dst[key] = target[key]
      })
    }
    _.keys(src).forEach(function (key) {
      if (!_.isMutable(src[key]) || !src[key]) {
        dst[key] = src[key]
      } else {
        if (!target[key]) {
          dst[key] = src[key]
        } else {
          dst[key] = merge(target[key], src[key])
        }
      }
    })
  }

  return dst
}

_.clone = function clone(obj) {
  var newObj, prop, item

  if (_.isArray(obj)) {
    newObj = _.mapEach(obj.slice(), clone)
  } else if (_.isObject(obj)) {
    newObj = {}
    for (prop in obj) {
      if (_.has(obj, prop)) {
        item = obj[prop]
        if (_.canIterate(item)) {
          newObj[prop] = clone(item)
        } else {
          newObj[prop] = item
        }
      }
    }
  } else {
    newObj = obj
  }

  return newObj
}

_.omit = function (obj, omit) {
  var prop, target = {}
  for (prop in obj) {
    if (_.has(obj, prop)) {
      if (prop !== omit) {
        target[prop] = obj[prop]
      }
    }
  }
  return target
}

_.keys = Object.keys || function (obj) {
  var k, keys = []
  for (k in obj) {
    if (_.has(obj, k)) {
      keys.push(k)
    }
  }
  return keys
}

_.clean = function clean(obj) {
  var buf, val, k, l

  if (_.isObject(obj)) {
    buf = {}
    for (k in obj) {
      if (_.has(obj, k)) {
        val = obj[k]
        if (_.canIterate(val)) {
          buf[k] = clean(val)
        } else {
          if (val !== undefined) {
            buf[k] = val
          }
        }
      }
    }
    obj = buf
  } else if (_.isArray(obj)) {
    buf = []
    for (k = 0, l = obj.length; k < l; k += 1) {
      val = obj[k]
      if (_.canIterate(val)) {
        buf.push(clean(val))
      } else if (val !== undefined) {
        buf.push(val)
      }
    }
    obj = buf
  }

  return obj
}

_.log = function () {
  if (hasConsole) {
    console.log.apply(console, arguments)
  }
}

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

function toS(obj) {
  return toString.call(obj)
}
