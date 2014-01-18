{
  rm
  ast
  read
  node
  expect
  inspect
  traverse
  generate-parser
} = require './lib/helper'

# code = read("#{__dirname}/fixtures/blocks.bs").to-string!

describe 'Basic expressions', ->

  before ->
    rm "#{__dirname}/../lib/parser.js"
    generate-parser!

  describe 'value assignment', (_) ->
    
    describe 'unquoted one-word string', (_) ->
      code = 'value: hello'

      it 'should be a ValueDeclaration', ->
        #inspect(traverse ast(code) .paths!)
        expect node ast(code), 'type' .to.exist
    
      it 'should have the value "hello"', ->
        expect node ast(code), 'id.name' .to.be.equal 'value'
    
    describe 'quoted string', (_) ->
      code = 'value: "hello oli!"'

      it 'should be a ValueDeclaration', ->
        expect node ast(code), 'type' .to.exist

      it 'should have the string value', ->
        expect node ast(code), 'value.value' .to.be.equal 'hello oli!'
    
    describe 'number', (_) ->
      code = 'value: 123'

      it 'should be a ValueDeclaration', ->
        expect node ast(code), 'type' .to.exist

    describe 'boolean', (_) ->
      code = 'value: yes'

      it 'should be a ValueDeclaration', ->
        expect node ast(code), 'type' .to.exist



