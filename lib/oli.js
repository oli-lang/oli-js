var fs = require('fs');
var util = require('util')
var PEG = require('pegjs');

var grammar = fs.readFileSync(__dirname + '/oli.peg').toString()
var parser = PEG.buildParser(grammar)

var source = fs.readFileSync(__dirname + '/../test/fixtures/blocks.bs').toString()

console.log( 
  util.inspect(parser.parse(source), { depth: null, loc: true } )
)

exports.parse = parser.parse