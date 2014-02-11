var readline = require('readline')
var version = require('../package.json').version
var echo = require('./helpers').log
var oli = require('./oli')

exports.init = function () {
  oliAsciiBanner()
  initReadline()
}

function initReadline() {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.setPrompt('oli> ')
  rl.prompt()
  rl.on('line', onWriteLine)
    .on('close', closeREPL)
}

function parse(code) {
  return JSON.stringify(oli.parse(code), null, 2)
}

function oliAsciiBanner() {
  echo([
    '        _   _    ',
    '       | | (_)   ',
    '   ___ | |  _    ',
    '  / _ \\| | | |  ',
    ' | (_) | |_| |   ',
    '  \\___/\\___|_| ',
    ''
  ].join('\n'))

  echo('Oli experimental REPL interface (' + version + ')')
  echo('Type "examples" to see code examples')
}

function printExamples() {
  echo([
    '  - 1, 2, 3',
    '  hello: world!',
    '  oli: rules: yes'
  ].join('\n'))
}

function onWriteLine(line) {
  switch (line = line.trim()) {
    case 'examples':
      printExamples()
      break
    default:
      echo(parse(line))
      break
  }
  this.prompt()
}

function closeREPL() {
  this.setPrompt('')
  this.prompt()
  echo('Thanks for using Oli!')
  process.exit(0)
}
