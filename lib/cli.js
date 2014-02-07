var fs = require('fs')
var program = require('commander')
var oli = require('./oli')
var version = require('../package.json').version

program
  .version(version)
  .usage('[options] <path/to/file.oli>')
  .option('-p, --parse', 'Parse and return the result as JSON')
  .option('-t, --tokens', 'Parse and return the result as JSON')
  .option('-o, --output <file>', 'Write output into a file instead of stdout')
  .option('-a, --ast', 'Return the parsed AST serialized as JSON')
  .option('-i, --in-line', 'Parse in-line argument as string')

program.on('--help', function () {
  console.log('  Examples:')
  console.log('')
  console.log('    $ oli file.oli > file.result.json')
  console.log('    $ oli file.oli --output file.result.json')
  console.log('    $ oli --ast file.oli')
  console.log('    $ oli --tokens file.oli')
  console.log('    $ oli --in-line "hello: oli!" > result.json')
  console.log('')
})

program.parse(process.argv)
