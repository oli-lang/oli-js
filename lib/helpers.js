var toString = Object.prototype.toString;

var _ = module.exports = {
  isBrowser: typeof window !== 'undefined',

  isDate: function(obj){
    return toS(obj) === '[object Date]';
  },

  isRegExp: function(obj){
    return toS(obj) === '[object RegExp]';
  },

  isError: function(obj){
    return toS(obj) === '[object Error]';
  },

  isBoolean: function(obj){
    return toS(obj) === '[object Boolean]';
  },

  isNumber: function(obj){
    return toS(obj) === '[object Number]';
  },

  isString: function(obj){
    return toS(obj) === '[object String]';
  },

  isArray: Array.isArray || function(obj){
    return toS(obj) === '[object Array]';
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

  extend: function (target, origin){
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

  logError: function (e, src) {
    src = src.split('\n')

    function errorLines(src) {
      var line, current = e.line - 4, end = e.line + 2
      var buf = []

      while (current <= end) {
        if (line = src[current]) {
          if (e.line === (current+1)) {
            buf.push(cyan((current+1) + ' | ' + line.substr(0, e.column - 1)) + bold(red(line.charAt(e.column - 1))) + cyan(line.substr(e.column)))
          } else {
            buf.push((green((current+1) + ' | ') + line))
          }
        }
        current += 1
      }

      return buf.join('\n')
    }

    log('Syntax error on line ' + e.line + ', column ' + e.column + ': ' + e.message + '\n')
    e.errorLines = errorLines(src)
    if (!_.isBrowser) {
      log(e.errorLines)
    }

    return e;
  }
};

function red(string) {
  return '\x1B[31m' + string + '\x1B[39m';
}

function green(string) {
  return '\x1B[32m' + string + '\x1B[39m';
}

function cyan(string) {
  return '\x1B[36m' + string + '\x1B[39m';
}

function bold(string) {
  return '\x1B[1m' + string + '\x1B[22m';
}

function log() {
  console.log.apply(console, arguments);
}

function toS(obj) {
  return toString.call(obj);
}
