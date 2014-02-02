module.exports = {
  Error: Error,
  TypeError: TypeError,
  SintaxError: SyntaxError
};

function SyntaxError() {
  return new Error('Error')
}
