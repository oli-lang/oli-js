{
  ast
  node
  parse
  expect
  inspect
} = require './lib/helper'

describe 'Parser', ->

  describe 'API', ->

    describe 'ast()', (_) ->

      it 'should have the proper AST object', ->
        expect (ast 'oli rules!').body[0] .to.have.property 'value' .and.be.equal 'oli rules!'

      it 'should have an object with number of code', ->
        expect (ast 'oli rules!').body[0] .to.have.property 'loc' .and.be.an.object

      describe 'options', (_) ->

        it 'should omit the lines of code AST node', ->
          expect (ast 'oli rules!', { loc: false }).body[0] .to.not.have.property 'loc'

  describe 'testing', (_) ->

    xit 'should parse property', ->
      inspect parse('''
        block:
          another:
            nested:
              list:
                - 1, 2, 3
              end
            end
            yes
          end
        end
      ''')
      expect parse('block: value') .to.be.null
