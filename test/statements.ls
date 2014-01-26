{
  ast
  node
  expect
  inspect
} = require './lib/helper'

describe 'Statements', ->

  describe 'blocks', ->
    describe 'primitives types', ->

      describe 'string', (_) ->

        it 'should parse "hello oli!" as string', ->
          expect node ast('string: "hello oli!"'), 'body.0.value' .to.be.equal 'hello oli!'

        it 'should parse "hello oli!" as string with single quotes', ->
          expect node ast("string: 'hello oli!'"), 'body.0.value' .to.be.equal 'hello oli!'

        it 'should parse "hello \'oli!" as string with escape character', ->
          expect node ast("string: 'hello \\'oli!'"), 'body.0.value' .to.be.equal 'hello \'oli!'

        it 'should parse "hello, oli!" as unquoted string', ->
          expect node ast('string: "hello, oli!"'), 'body.0.value' .to.be.equal 'hello, oli!'

        it 'should parse "in line" as string', ->
          expect node ast('"in line"'), 'value' .to.be.equal 'in line'

        it 'should parse "in\\nline" as multi-line string', ->
          expect node ast('"in\nline"'), 'value' .to.be.equal 'in\nline'

      describe 'number', (_) ->

        it 'should parse "12" as numeric integer', ->
          expect node ast('number: 12'), 'body.0.value' .to.be.equal 12

        it 'should parse "+1234" as numeric possitive integer', ->
          expect node ast('number: +1234'), 'body.0.value' .to.be.equal 1234

        it 'should parse "-183" as numeric signed off integer', ->
          expect node ast('number: -183'), 'body.0.value' .to.be.equal -183

        it 'should parse as "99.123" number literal', ->
          expect node ast('number: 99.123'), 'body.0.value' .to.be.equal 99.123

        it 'should parse as "-99.123" as float signed off literal', ->
          expect node ast('number: -99.123'), 'body.0.value' .to.be.equal -99.123

      describe 'boolean', (_) ->

        it 'should parse "boolean: yes" as boolean literal', ->
          expect node ast('boolean: yes'), 'body.0.value' .to.be.true

        it 'should parse "boolean: false" as boolean literal', ->
          expect node ast('boolean: no'), 'body.0.value' .to.be.false
          expect node ast('boolean: false'), 'body.0.value' .to.be.false

        it 'should parse "false\\ntrue" as both boolean values', ->
          ast-tree = ast('false\ntrue')
          expect node ast-tree, '0.value' .to.be.equal false
          expect node ast-tree, '1.value' .to.be.equal true

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

        it 'should parse "hello: form: oli: lang: ..." as indented blocks', ->
          code = ast '''
          hello:
            from:
              oli:
                lang: 'this is oli!'
              end
            end
          end
          '''
          expect node code, 'body.0.body.0.body.0.body.0.value'
            .to.be.equal 'this is oli!'

        it 'should parse a nested block statements of strings', ->
          code = ast '''
          hello:
            from:
              text:
                'awesome'
                'it is cool'
                'looks nice!'
              end
            end
          end
          '''
          expect node code, 'body.0.body.0.body.2.value'
            .to.be.equal 'looks nice!'

        it 'should parse a nested block statements of numbers', ->
          code = ast '''
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
          expect node code, 'body.0.body.0.body.2.value'
            .to.be.equal -3

        it 'should parse a nested block statements of boolean', ->
          code = ast '''
          hello:
            from:
              text:
                true
                false
                yes
                no
              end
            end
          end
          '''
          expect node code, 'body.0.body.0.body.3.value'
            .to.be.equal false

        it 'should parse a nested block of mix types and separators', ->
          code = ast '''
          hello:
            from:
              text:
                true 'it\\'s cool!!'
                12.09130
                [
                  test, this rules!
                  'oli' 'is' 'pretty'
                  oh, yes
                ]
                'amazing pepe' 'another string'
                @value: [ 1, 2 ]
              end
            end
          end
          '''
          expect node code, 'body.0.body.0.body.3.elements.4.value'
            .to.be.equal 'pretty'

      describe 'multi-statement', (_) ->

        it 'should parse both first-level blocks', ->
          ast-obj = ast '''
          hello:
            world: true
            'string'
            yes
          end
          another block: 'fantastic' end
          final block: yes
          '''
          expect node ast-obj, '0.body.1.value'
            .to.be.equal 'string'
          expect node ast-obj, '1.body.0.value'
            .to.be.equal 'fantastic'
          expect node ast-obj, '2.body.0.value'
            .to.be.equal true

        it 'first level primitives values', ->
          ast-obj = ast '''
          true
          123.2313
          'hello oli!'
          '''
          expect node ast-obj, '0.value'
            .to.be.equal true
          expect node ast-obj, '2.value'
            .to.be.equal 'hello oli!'

