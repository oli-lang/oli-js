module.exports = {
  TypeError: TypeError,
  SyntaxError: SyntaxError,
  CompileError: CompileError,
  ReferenceError: ReferenceError
}

function TypeError(message) {
  this.name     = 'TypeError'
  this.message  = identifier + ' is not defined'
}

function ReferenceError(identifier) {
  this.name     = 'ReferenceError'
  this.message  = identifier + ' is not defined'
}

function SyntaxError(message, expected, found, offset, line, column) {
  this.name     = "SyntaxError";
  this.message  = message;
  this.expected = expected;
  this.found    = found;
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
