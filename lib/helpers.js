var toString = Object.prototype.toString;
var isBrowser = typeof window !== 'undefined';

var _ = module.exports = {

  isBrowser: isBrowser,

  isDate: function (obj) {
    return toS(obj) === '[object Date]';
  },

  isError: function (obj) {
    return toS(obj) === '[object Error]';
  },

  isBoolean: function (obj) {
    return toS(obj) === '[object Boolean]';
  },

  isNumber: function (obj) {
    return toS(obj) === '[object Number]';
  },

  isString: function (obj) {
    return toS(obj) === '[object String]';
  },

  isArray: Array.isArray || function(obj) {
    return toS(obj) === '[object Array]';
  },

  isObject: function (obj) {
    return toS(obj) === '[object Object]';
  },

  canIterate: function (obj) {
    return _.isObject(obj) || _.isArray(obj)
  },

  isMutable: function (obj) {
    return _.isObject(obj) || _.isArray(obj) || _.isDate(obj)
  },

  forEach: function (obj, fn) {
    var i, item, length

    if (!obj) return;

    if (typeof obj.forEach === 'function') {
      obj.forEach(fn)
    } else {
      if (_.isObject(obj)) {
        keys = _.objKeys(obj)
        length = keys.length
        for (i = 0; i < length; i += 1) {
          item = obj[keys[i]]
          fn(item, keys[i], item)
        }
      } else {
        length = obj.length
        for (i = 0; i < length; i += 1) {
          item = obj[i]
          fn(item, i, item)
        }
      }
    }
  },

  mapEach: function (obj, fn) {
    var i, el, length, results = []

    if (!obj) return;

    if (_.isObject(obj)) {
      length = _.objKeys(obj).length
    } else {
      length = obj.length
    }

    for (i = 0; i < length; i += 1) {
      el = obj[i];
      results.push(fn(el, i, obj))
    }

    return results;
  },

  extend: function (target, origin) {
    var prop

    if (!_.isObject(origin)) return target;

    for (prop in origin) {
      if (origin.hasOwnProperty(prop)) {
        target[prop] = origin[prop];
      }
    }

    return target
  },

  merge: function merge(target, src) {
    var array = _.isArray(src)
    var dst = array && [] || {}

    if (array) {
      target = target || []
      dst = dst.concat(target)
      src.forEach(function (e, i) {
        if (typeof target[i] === 'undefined') {
          dst[i] = e
        } else if (typeof e === 'object') {
          dst[i] = merge(target[i], e)
        } else {
          if (target.indexOf(e) === -1) {
            dst.push(e)
          }
        }
      })
    } else {
      if (target && typeof target === 'object') {
        _.objKeys(target).forEach(function (key) {
          dst[key] = target[key]
        })
      }
      _.objKeys(src).forEach(function (key) {
        if (typeof src[key] !== 'object' || !src[key]) {
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
  },

  clone: function clone(obj) {
    var newObj, prop, item

    if (_.isArray(obj)) {
      newObj = _.mapEach(obj.slice(), clone)
    } else if (_.isObject(obj)) {
      newObj = {}
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
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
  },

  omit: function (obj, omit) {
    var prop, target = {}
    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (prop !== omit) {
          target[prop] = obj[prop]
        }
      }
    }
    return target
  },

  objKeys: Object.keys || function (obj) {
    var i, l, key, keys = []

    for (i = 0, l = obj.length; i < l; i += 1) {
      key = obj[i]
      keys.push(key)
    }

    return keys
  },

  cleanUndefined: function cleanUndefined(obj) {
    var store

    if (_.isArray(obj)) {
      var store = []
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
        if (node == null) {
          return _.omit(obj, name)
        }
        return node
      })
    }

    return obj
  },

  mapLeafNodes: function (obj, cb) {
    _.forEach(obj, function (node, name) {
      if (_.canIterate(node)) {
        return _.mapLeafNodes(node, cb)
      }
      obj = cb(node, name, obj)
    })
    return obj
  },

  log: function () {
    if (console && console.log) {
      console.log.apply(console, arguments)
    }
  }

}

function toS(obj) {
  return toString.call(obj)
}
