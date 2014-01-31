var toS, isDate, isRegExp, isError, isBoolean, isNumber, isString, isArray, forEach;
toS = function(){
  return obj(Object.prototype.toString.call(obj));
};
isDate = function(){
  return obj(deepEq$(toS(obj), '[object Date]', '==='));
};
isRegExp = function(){
  return obj(deepEq$(toS(obj), '[object RegExp]', '==='));
};
isError = function(){
  return obj(deepEq$(toS(obj), '[object Error]', '==='));
};
isBoolean = function(){
  return obj(deepEq$(toS(obj), '[object Boolean]', '==='));
};
isNumber = function(){
  return obj(deepEq$(toS(obj), '[object Number]', '==='));
};
isString = function(){
  return obj(deepEq$(toS(obj), '[object String]', '==='));
};
isArray = Array.isArray || function(xs){
  return deepEq$(Object.prototype.toString.call(xs), '[object Array]', '===');
};
forEach = function(xs, fn){
  var i$, len$, el, results$ = [];
  if (xs.forEach) {
    return xs.forEach(fn);
  } else {
    for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
      el = xs[i$];
      results$.push(fn(el, i, el));
    }
    return results$;
  }
};
function deepEq$(x, y, type){
  var toString = {}.toString, hasOwnProperty = {}.hasOwnProperty,
      has = function (obj, key) { return hasOwnProperty.call(obj, key); };
  var first = true;
  return eq(x, y, []);
  function eq(a, b, stack) {
    var className, length, size, result, alength, blength, r, key, ref, sizeB;
    if (a == null || b == null) { return a === b; }
    if (a.__placeholder__ || b.__placeholder__) { return true; }
    if (a === b) { return a !== 0 || 1 / a == 1 / b; }
    className = toString.call(a);
    if (toString.call(b) != className) { return false; }
    switch (className) {
      case '[object String]': return a == String(b);
      case '[object Number]':
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        return +a == +b;
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') { return false; }
    length = stack.length;
    while (length--) { if (stack[length] == a) { return true; } }
    stack.push(a);
    size = 0;
    result = true;
    if (className == '[object Array]') {
      alength = a.length;
      blength = b.length;
      if (first) { 
        switch (type) {
        case '===': result = alength === blength; break;
        case '<==': result = alength <= blength; break;
        case '<<=': result = alength < blength; break;
        }
        size = alength;
        first = false;
      } else {
        result = alength === blength;
        size = alength;
      }
      if (result) {
        while (size--) {
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))){ break; }
        }
      }
    } else {
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
        return false;
      }
      for (key in a) {
        if (has(a, key)) {
          size++;
          if (!(result = has(b, key) && eq(a[key], b[key], stack))) { break; }
        }
      }
      if (result) {
        sizeB = 0;
        for (key in b) {
          if (has(b, key)) { ++sizeB; }
        }
        if (first) {
          if (type === '<<=') {
            result = size < sizeB;
          } else if (type === '<==') {
            result = size <= sizeB
          } else {
            result = size === sizeB;
          }
        } else {
          first = false;
          result = size === sizeB;
        }
      }
    }
    stack.pop();
    return result;
  }
}