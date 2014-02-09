var version = require('../package.json').version
var readline = require('readline')
var echo = require('./helpers').log
var oli = require('./oli')

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

echo('Oli experimental REPL interface (' + version + ')')
echo('Type "examples" to see code examples')

rl.setPrompt('oli> ')
rl.prompt()

rl.on('line', function (line) {
    switch (line = line.trim()) {
      case 'examples':
        printExamples()
        break
      default:
        echo(parse(line))
        break
    }
    rl.prompt()
  })
  .on('close', function () {
    rl.setPrompt('')
    rl.prompt()
    echo('Thanks for using Oli!')
    process.exit(0)
  })

function parse(code) {
  return JSON.stringify(oli.parse(code), null, 2)
}

function printExamples() {
  echo([
    '  - 1, 2, 3',
    '  hello: world!',
    '  oli: rules: yes'
  ].join('\n'))
}
