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
      /*inspect parse '''
        block:
          another:
            nested:
              list:
                - 1, 2, 3
              end
            end
            yes
          end
          another:
            block:
              for::
            end
          end
        end
      ''' */
      inspect parse '''
        message > Person:
          required > string: name: 1
          required > int32: id: 2
          optional > string: email: 3

          enum > PhoneType:
            MOBILE: 0
            HOME:: 1
            WORK: 2
          end

          message > PhoneNumber:
            required string: number: 1
            optional PhoneType: type (default: HOME): 2
          end
          repeated > PhoneNumber: phone: 4
        end
      '''
      process.exit!
      expect parse('block: value') .to.be.null

