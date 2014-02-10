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
    var array = Array.isArray(src)
    var dst = array && [] || {}

    if (array) {
      target = target || []
      dst = dst.concat(target)
      src.forEach(function(e, i) {
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
        Object.keys(target).forEach(function(key) {
          dst[key] = target[key]
        })
      }
      Object.keys(src).forEach(function(key) {
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
    var target = {}
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (prop !== omit) {
          target[prop] = obj[prop]
        }
      }
    }
    return target
  },

  objKeys: Object.keys || function(obj) {
    var keys, i, l, key
      keys = []

    for (i = 0, l = obj.length; i < l; i += 1) {
      key = obj[i]
      keys.push(key)
    }

    return keys
  },

  log: function () {
    if (console && console.log) {
      console.log.apply(console, arguments)
    }
  },

  cleanUndefined: function(obj) {
    if (_.canIterate(obj)) {
      obj = _.mapLeafNodes(obj, function(node, name, obj) {
        if (node == null) {
          return _.omit(obj, name)
        }
        return node
      })
    }
    return obj
  },

  mapLeafNodes: function(obj, cb) {
    _.forEach(obj, function(node, name) {
      if (_.canIterate(node)) {
        return _.mapLeafNodes(node, cb)
      }
      obj = cb(node, name, obj)
    })
    return obj
  },

  handleError: function(error, src) {

    error.errorLines = errorLines(src, error)

    if (error.name === 'SintaxError') {
      error.fullMessage = SintaxErrorMessage(error)
    } else {
      error.fullMessage = error.name + ': ' + error.message
    }

    if (!isBrowser) {
      _.log(error.fullMessage)
      _.log('\n' + error.errorLines.join('\n'))
    }

    return error

    function SintaxErrorMessage(error) {
      return 'Syntax error on line ' + error.line + ', column ' + error.column + ': ' + error.message
    }

    function errorLines(src, e) {
      var line
      var current = e.line - 5
      var end = e.line + 4
      var buf = []

      src = src.split('\n')

      do {
        end -= 1
      } while (end > src.length)
      do {
        current += 1
      } while (current < 0)

      while (current < end) {
        buf.push(renderLine())
        current += 1
      }

      return buf

      function length(n) {
        return (n).toString().length
      }

      function renderLine() {
        var lineNumber = current + 1
        line = src[current]
        if (e.line === lineNumber) {
          line = red((lineNumber) + lineSpace(lineNumber) + '| ') + line.substr(0, e.column - 1) + red(line.charAt(e.column - 1)) + line.substr(e.column)
        } else {
          line = green((lineNumber) + lineSpace(lineNumber) + '| ') + line
        }
        return line
      }

      function lineSpace(line) {
        var spaces = ''
        if (length(line) < length(end)) {
          spaces += isBrowser ? '&nbsp;&nbsp;' : ' '
        }
        return spaces
      }
    }

    function red(string) {
      return isBrowser ?
        '<span style="color:red;">' + string + '</span>' : '\x1B[31m' + string + '\x1B[39m'
    }

    function green(string) {
      return isBrowser ?
        '<span style="color:green;">' + string + '</span>' : '\x1B[32m' + string + '\x1B[39m'
    }

    function bold(string) {
      return isBrowser ?
        '<b>' + string + '</b>' : '\x1B[1m' + string + '\x1B[22m'
    }
  }
}

function toS(obj) {
  return toString.call(obj)
}
