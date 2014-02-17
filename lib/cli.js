'use strict'

var fs = require('fs')
var echo = require('./helpers').log
var program = require('commander')
var oli = require('./oli')
var version = require('../package.json').version

var options = {
  indent: 2,
  mode: 'parse'
}

exports.parse = function (args) {
  program.parse(args)

  try {
    init()
  } catch (e) {
    echo(e.fullMessage)
    if (e.errorLines) {
      echo('\n' + e.errorLines.join('\n'))
    }
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

function init() {
  if (options.repl) {
    require('./repl').init()
  } else {
    output(parse())
  }
}

function parse() {
  return toJSON(
    oli[options.mode](
      getSource()
    )
  )
}

function toJSON(obj) {
  if (obj != null) {
    obj = JSON.stringify(obj, null, options.indent)
  } else {
    obj = ''
  }
  return obj
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
  var args = program.args

  if (options.inLine) {
    source = args.join(' ')
  } else {
    source = fs.readFileSync(args[0])
  }

  return source
}
