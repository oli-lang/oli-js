var program = require('commander')
var version = require('../package.json').version

exports.parse = function (args) {
  program.parse(args)
}

program
  .version(version)
  .usage('[options] <path/to/file.oli>')
  .option('-p, --parse <file>', 'Parse a Oli file and stdout the JSON compilation result')
  .option('-o, --output <file>', 'Write to output into file')
