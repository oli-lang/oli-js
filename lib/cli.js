var fs = require('fs')
var echo = require('./helpers').log
var program = require('commander')
var oli = require('./oli')
var version = require('../package.json').version

var options = { indent: 2 }

exports.parse = function (args) {
  program.parse(args)

  try {
    if (options.repl) {
      require('./repl').init()
    } else {
      output(parse())
    }
  } catch (e) {
    echo('Error:', e.message)
    process.exit(1)
  }
}

program
  .version(version)
  .usage('[options] <path/to/file.oli>')
  .option('-p, --parse', 'parse and return the result as JSON')
  .option('-t, --tokens', 'parse and return a collection of the tokens as JSON')
  .option('-o, --output <file>', 'write output into a file instead of stdout')
  .option('-a, --ast', 'return the parsed AST serialized as JSON')
  .option('-i, --in-line', 'parse in-line argument as string')
  .option('-d, --indent <size>', 'JSON output indent size. Default to 2')
  .option('-r, --repl', 'use the interactive read-eval-print loop interface')

program
  .on('--help', function () {
    echo('  Examples:')
    echo('')
    echo('    $ oli file.oli > file.result.json')
    echo('    $ oli file.oli -o file.result.json')
    echo('    $ oli --ast file.oli')
    echo('    $ oli --tokens file.oli')
    echo('    $ oli --in-line "hello: oli!" > result.json')
    echo('')
  })

program
  .on('tokens', function () {
    options.mode = 'tokens'
  })
  .on('ast', function () {
    options.mode = 'ast'
  })
  .on('repl', function () {
    options.repl = true
  })
  .on('in-line', function () {
    options.inLine = true
  })
  .on('output', function (file) {
    options.output = file
  })
  .on('indent', function (size) {
    options.indent = size == null ? 2 : parseInt(size, 10)
  })

function parse() {
  var output

  switch (options.mode) {
    case 'tokens':
      output = oli.tokens(getSource())
      break
    case 'ast':
      output = oli.ast(getSource())
      break
    default:
      output = oli.parse(getSource())
      break
  }

  if (output != null) {
    output = JSON.stringify(output, null, options.indent)
  }

  return output || ''
}

function output(result) {
  if (options.output) {
    fs.writeFileSync(options.output, result)
  } else {
    echo(result)
  }
}

function getSource() {
  var source
  if (options.inLine) {
    source = program.args.join(' ')
  } else {
    source = fs.readFileSync(program.args[0])
  }
  return source
}
