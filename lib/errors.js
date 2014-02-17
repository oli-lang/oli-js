'use strict'

var isBrowser = require('./helpers').isBrowser

exports = module.exports = {
  TypeError: TypeError,
  SyntaxError: SyntaxError,
  CompileError: CompileError,
  ReferenceError: ReferenceError,
  addErrorLines: addErrorLines
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

function addErrorLines(error, src) {
  if (error.line != null) {
    error.errorLines = getErrorLines(src, error)
  }

  if (error.name === 'SintaxError') {
    error.fullMessage = SintaxErrorMessage(error)
  } else {
    error.fullMessage = error.name + ': ' + error.message
  }

  return error
}

//
// Helpers
//

function getErrorLines(src, e) {
  var line
  var buf = []
  var current = e.line - 5
  var end = e.line + 4

  src = src.split('\n')

  do { end -= 1 } while (end > src.length)
  do { current += 1 } while (current < 0)

  while (current < end) {
    buf.push(renderLine(line, src, current, end, e))
    current += 1
  }

  return buf
}

function renderLine(line, src, current, end, e) {
  var lineNumber = current + 1
  line = src[current]
  if (e.line === lineNumber) {
    line = red((lineNumber) + lineSpace(lineNumber, end) + '| ') + line.substr(0, e.column - 1) + red(line.charAt(e.column - 1)) + line.substr(e.column)
  } else {
    line = green((lineNumber) + lineSpace(lineNumber, end) + '| ') + line
  }
  return line
}

function lineSpace(line, end) {
  var spaces = ''
  if (length(line) < length(end)) {
    spaces += isBrowser ? '&nbsp;&nbsp;' : ' '
  }
  return spaces
}

function SintaxErrorMessage(error) {
  return 'Syntax error on line ' + error.line + ', column ' + error.column + ': ' + error.message
}

function length(n) {
  return (n).toString().length
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
