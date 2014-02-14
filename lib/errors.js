var isBrowser = require('./helpers').isBrowser

exports = module.exports = {
  handle: addLinesReport,
  TypeError: TypeError,
  SyntaxError: SyntaxError,
  CompileError: CompileError,
  ReferenceError: ReferenceError
}

function TypeError(message) {
  this.name     = 'TypeError'
  this.message  = message
}

function ReferenceError(identifier) {
  this.name     = 'ReferenceError'
  this.message  = identifier + ' is not defined'
}

function SyntaxError(message, offset, line, column) {
  this.name     = "SyntaxError";
  this.message  = message;
  this.offset   = offset;
  this.line     = line;
  this.column   = column;
}

function CompileError(message, offset, line, column) {
  this.name     = "CompileError";
  this.message  = message;
  this.offset   = offset;
  this.line     = line;
  this.column   = column;
}

CompileError.prototype =
SyntaxError.prototype =
ReferenceError.prototype =
ReferenceError.prototype = Error.prototype

/*!
 * Pending refactor!
 */
function addLinesReport(error, src) {

  error.errorLines = errorLines(src, error)

  if (error.name === 'SintaxError') {
    error.fullMessage = SintaxErrorMessage(error)
  } else {
    error.fullMessage = error.name + ': ' + error.message
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

  function red(str) {
    return isBrowser ?
      '<span style="color:red;">' + str + '</span>' : '\x1B[31m' + str + '\x1B[39m'
  }

  function green(str) {
    return isBrowser ?
      '<span style="color:green;">' + str + '</span>' : '\x1B[32m' + str + '\x1B[39m'
  }

  function bold(str) {
    return isBrowser ?
      '<b>' + str + '</b>' : '\x1B[1m' + str + '\x1B[22m'
  }
}
