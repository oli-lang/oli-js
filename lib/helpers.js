var toString = Object.prototype.toString;
var isBrowser =  typeof window !== 'undefined';

var _ = module.exports = {

  isBrowser: isBrowser,

  isDate: function(obj) {
    return toS(obj) === '[object Date]';
  },

  isRegExp: function(obj) {
    return toS(obj) === '[object RegExp]';
  },

  isError: function(obj) {
    return toS(obj) === '[object Error]';
  },

  isBoolean: function(obj) {
    return toS(obj) === '[object Boolean]';
  },

  isNumber: function(obj) {
    return toS(obj) === '[object Number]';
  },

  isString: function(obj) {
    return toS(obj) === '[object String]';
  },

  isArray: Array.isArray || function(obj) {
    return toS(obj) === '[object Array]';
  },

  isObject: function(obj) {
    return toS(obj) === '[object Object]';
  },

  forEach: function(obj, fn){
    var i$, len$, el, results$ = [];
    if (obj.forEach) {
      return obj.forEach(fn);
    } else {
      for (i$ = 0, len$ = obj.length; i$ < len$; ++i$) {
        el = obj[i$];
        results$.push(fn(el, i, el));
      }
      return results$;
    }
  },

  extend: function (target, origin) {
    if (!_.isObject(origin)) return target;
    for (var prop in origin) {
      if (origin.hasOwnProperty(prop)) {
        target[prop] = origin[prop];
      }
    }
    return target;
  },

  omit: function (obj, omit){
    var target = {}
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (prop !== omit) {
          target[prop] = obj[prop];
        }
      }
    }
    return target;
  },

  objKeys: Object.keys || function(obj){
    var keys, i$, len$, key;
    keys = [];
    for (i$ = 0, len$ = obj.length; i$ < len$; ++i$) {
      key = obj[i$];
      keys.push(key);
    }
    return keys;
  },

  handleError: function (error, src) {

    // extend error
    error.errorLines = errorLines(src, error)
    error.fullMessage = 'Syntax error on line ' + error.line + ', column ' + error.column + ': ' + error.message

    if (!isBrowser) {
      log(error.fullMessage)
      log('\n' + error.errorLines.join('\n'))
    }

    return error;

    function errorLines(src, e) {
      var line
      var current = e.line - 4
      var end = e.line + 4
      var buf = []

      src = src.split('\n')

      do { end -= 1 } while (end > src.length)
      do { current += 1 } while (current < 0)

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
          spaces += isBrowser ? '&nbsp;' : ' '
        }
        return spaces
      }
    }

    function red(string) {
      return isBrowser ?
        '<span style="color:red;">' + string + '</span>'
      : '\x1B[31m' + string + '\x1B[39m';
    }

    function green(string) {
      return  isBrowser ?
        '<span style="color:green;">' + string + '</span>'
      : '\x1B[32m' + string + '\x1B[39m';
    }

    function bold(string) {
      return isBrowser ?
        '<b>' + string + '</b>'
      : '\x1B[1m' + string + '\x1B[22m';
    }
  }
};

function log() {
  console.log.apply(console, arguments);
}

function toS(obj) {
  return toString.call(obj);
}
