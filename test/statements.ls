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

describe 'Statements', ->

  before ->
    rm "#{__dirname}/../lib/parser.js"
    generate-parser!

  describe 'value assignment', ->
    
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

  describe 'block assignment', ->
    
    describe 'in-line', (_) ->

      it 'should parse "oli!" as string literal"', ->
        expect node ast('hello: "oli!" end'), 'body.0.value' 
          .to.be.equal 'oli!'
     
      it 'should parse "hello: yes end"', ->
        expect node ast('hello: yes end'), 'body.0.value' 
          .to.be.equal true

      it 'should parse "hello: 13.85 end"', ->
        expect node ast('hello: 13.85 end'), 'body.0.value' 
          .to.be.equal 13.85

      it 'should parse "hello: [ 1, 2 ] end"', ->
        expect node ast('hello: [ 1, 2 ] end'), 'body.0.0.value'
          .to.be.equal 1

    describe 'nested', (_) ->

      it 'should parse "hello: from: oli: lang: oli!"', ->
        expect node ast('hello: from: oli: lang: oli!'), 'value.value.value.value.value'
          .to.be.equal 'oli!'

      it 'should parse "hello: from: oli: lang: oli!" as indented blocks', ->
        code = '''
        hello: 
          from:
            lang: this is oli! # comment!
          end
        end
        '''
        #inspect ast(code)
        expect node ast(code), 'body.0.body.0.value.value'
          .to.be.equal 'this is oli!'

