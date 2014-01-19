{
  ast
  node
  expect
  inspect
} = require './lib/helper'

describe 'Statements', ->

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
        expect node ast(code), 'body.0.value' .to.be.equal 'hello oli!'
    
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
        expect node ast('hello: [ 1, 2 ] end'), 'body.0.elements.0.value'
          .to.be.equal 1

    describe 'nested', (_) ->

      it 'should parse "hello: from: oli: lang: oli!"', ->
        expect node ast('hello: from: oli: lang: oli!'), 'body.0.body.0.body.0.body.0.value'
          .to.be.equal 'oli!'

      it 'should parse "hello: from: oli: lang: ..." as indented blocks', ->
        code = '''
        hello: 
          from:
            lang: this is oli! # comment!
          end
        end
        '''
        expect node ast(code), 'body.0.body.0.body.0.value'
          .to.be.equal 'this is oli!'

      it 'should parse a nested block statements of strings', ->
        code = '''
        hello: 
          from:
            text: 
              'this'
              'is'
              'oli!'
            end
          end
        end
        '''
        expect node ast(code), 'body.0.body.0.body.2.value'
          .to.be.equal 'oli!'

      it 'should parse a nested block statements of numbers', ->
        code = '''
        hello: 
          from:
            text: 
              12345
              0.1231
              -3
            end
          end
        end
        '''
        expect node ast(code), 'body.0.body.0.body.2.value'
          .to.be.equal -3

      it 'should parse a nested block of mix types and separators', ->
        code = '''
        hello: 
          from:
            text: 
              true, 'it\\'s cool!!'
              12.09130
              [ 
                'oli',
                'rules!',
                yes
              ]
              'amazing pepe' 'another string'
              &value: [ 1, 2 ]
            end
          end
        end
        '''
        expect node ast(code), 'body.0.body.0.body.3.elements.1.value'
          .to.be.equal 'rules!'
        expect node ast(code), 'body.0.body.0.body.6.body.0.elements.1.value'
          .to.be.equal 2
