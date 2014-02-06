module.exports = {
  TypeError: TypeError,
  SintaxError: SyntaxError,
  ParseError: ParseError,
  CompileError: CompileError,
  ReferenceError: ReferenceError
}

function TypeError(exception) {
  return new Error('Error')
}

function ReferenceError() {
  return new Error('Error')
}

function SyntaxError(error) {
  this.message  = message;
  this.expected = expected;
  this.found    = found;
  this.offset   = offset;
  this.line     = line;
  this.column   = column;
  this.name     = "SyntaxError";
}

function ParseError() {
  return new Error('Error')
}

function CompileError() {
  return new Error('Error')
}
