var toString = Object.prototype.toString;

var _ = module.exports = {
  isBrowser: typeof window !== 'undefined',

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

  log: log,

  handleError: function (e, src) {
    src = src.split('\n')

    e.errorLines = errorLines(src)
    e.fullMessage = 'Syntax error on line ' + e.line + ', column ' + e.column + ': ' + e.message

    if (!_.isBrowser) {
      log(e.fullMessage)
      log('\n' + e.errorLines)
    }

    return e;

    function errorLines(src) {
      var line, current = e.line - 4, end = e.line + 2
      var buf = []

      while (current <= end) {
        if (line = src[current]) {
          if (e.line === (current += 1)) {
            buf.push(red((current) + lineSpace(current) + ' | ') + line.substr(0, e.column - 1) + red(line.charAt(e.column - 1)) + line.substr(e.column))
          } else {
            buf.push((green((current) + lineSpace(current) + ' | ') + line))
          }
        }
      }

      return buf.join(_.isBrowser ? '<br />' : '\n')

      function length(n) {
        return (n).toString().length
      }

      function lineSpace(line) {
        var spaces = ''
        if (length(line) < length(end)) {
          spaces += ' '
        }
        return spaces
      }
    }

    function red(string) {
      return _.isBrowser ?
        '<span style="color:red;">' + string + '</span>'
      : '\x1B[31m' + string + '\x1B[39m';
    }

    function green(string) {
      return  _.isBrowser ?
        '<span style="color:green;">' + string + '</span>'
      : '\x1B[32m' + string + '\x1B[39m';
    }

    function bold(string) {
      return _.isBrowser ?
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
