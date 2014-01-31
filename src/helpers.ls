
toS = (obj) -> Object.prototype.toString.call(obj)
isDate = (obj) -> toS(obj) === '[object Date]'
isRegExp = (obj) -> toS(obj) === '[object RegExp]'
isError = (obj) -> toS(obj) === '[object Error]'
isBoolean = (obj) -> toS(obj) === '[object Boolean]'
isNumber = (obj) -> toS(obj) === '[object Number]'
isString = (obj) -> toS(obj) === '[object String]'

isArray = Array.isArray || (xs) -> Object.prototype.toString.call(xs) === '[object Array]'

forEach = (xs, fn) ->
  if xs.forEach
    return xs.forEach fn
  else
    for el in xs then fn el, i, el
