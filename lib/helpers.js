'use strict'

var toString = Object.prototype.toString
var hasOwn = Object.prototype.hasOwnProperty
var isBrowser = typeof window !== 'undefined'

'use strict';

var _ = exports = module.exports = {}

_.isBrowser = isBrowser

_.isDate = function (obj) {
  return toS(obj) === '[object Date]'
}

_.isError = function (obj) {
  return toS(obj) === '[object Error]'
}

_.isBoolean = function (obj) {
  return toS(obj) === '[object Boolean]'
}

_.isNumber = function (obj) {
  return toS(obj) === '[object Number]'
}

_.isString = function (obj) {
  return toS(obj) === '[object String]'
}

_.isArray = Array.isArray || function(obj) {
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
    el = obj[i]
    results.push(fn(el, i, obj))
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

_.cleanUndefined = function cleanUndefined(obj) {
  var store

  if (_.isArray(obj)) {
    store = []
    _.forEach(obj, function (item) {
      if (item != null) {
        if (_.canIterate(item)) {
          item = cleanUndefined(item)
        }
        store.push(item)
      }
    })
    obj = store
  } else if (_.isObject(obj)) {
    obj = _.mapLeafNodes(obj, function (node, name, obj) {
      if (node === undefined) {
        return _.omit(obj, name)
      }
      return node
    })
  }

  return obj
}

_.mapLeafNodes = function (obj, cb) {
  _.forEach(obj, function (node, name) {
    if (_.canIterate(node)) {
      return _.mapLeafNodes(node, cb)
    }
    obj = cb(node, name, obj)
  })
  return obj
}

_.log = function () {
  if (console && console.log) {
    console.log.apply(console, arguments)
  }
}

function toS(obj) {
  return toString.call(obj)
}
