{
  ast
  node
  expect
} = require './lib/helper'

describe 'Statements', ->

  describe 'hidden variables', (_) ->

    it 'should parse "value = hello oli!" as string', ->
      expect node ast('value = hello oli!'), 'expression.right.value' .to.be.equal 'hello oli!'

    it 'should parse "value = hello oli!" as quoted string', ->
      expect node ast('value = "hello oli!"'), 'expression.right.value' .to.be.equal 'hello oli!'

    it 'should parse "value = true" as boolean', ->
      expect node ast('value = true'), 'expression.right.value' .to.be.equal true

    it 'should parse "value = -12.3" as number', ->
      expect node ast('value = -12.3'), 'expression.right.value' .to.be.equal -12.3

    it 'should parse "value = -12.3 end" as multi-line statement', ->
      ast-obj = ast '''
      value =
        -12.3
      end
      '''
      expect node ast-obj, 'expression.right.body.0.value' .to.be.equal -12.3

    it 'should parse "value = name: oli end" as multi-line statement', ->
      ast-obj = ast '''
      value:
        name: oli
      end
      '''
      expect node ast-obj, 'expression.right.body.0.expression.right.value' .to.be.equal 'oli'

  describe 'blocks', ->

    describe 'first level list', (_) ->

      it 'should parse "-- yes" as list', ->
        expect node ast('-- yes'), 'elements.0.value' .to.be.true

      it 'should parse "-- block: nested: hello!" as list', ->
        ast-obj = ast '''
        --
        block:
          nested:
            hello!
          end
        end
        '''
        expect node ast-obj, 'elements.0.expression.right.body.0.expression.right.body.0.value'
          .to.be.equal 'hello!'

    describe 'primitives types', ->

      describe 'string', (_) ->

        it 'should parse "hello oli!" as string', ->
          expect node ast('string: "hello oli!"'), 'expression.right.value' .to.be.equal 'hello oli!'

        it 'should parse "hello oli!" as string with single quotes', ->
          expect node ast("string: 'hello oli!'"), 'expression.right.value' .to.be.equal 'hello oli!'

        it 'should parse "hello \'oli!" as string with escape character', ->
          expect node ast("string: 'hello \\'oli!'"), 'expression.right.value' .to.be.equal 'hello \'oli!'

        it 'should parse "hello, oli!" as quoted string', ->
          expect node ast('string: "hello, oli!"'), 'expression.right.value' .to.be.equal 'hello, oli!'

        it 'should parse "in line" as string', ->
          expect node ast('"in line"'), 'value' .to.be.equal 'in line'

        it 'should parse "in\\nline" as multi-line string', ->
          expect node ast('"in\nline"'), 'value' .to.be.equal 'in\nline'

      describe 'number', (_) ->

        it 'should parse "12" as numeric integer', ->
          expect node ast('number: 12'), 'expression.right.value' .to.be.equal 12

        it 'should parse "+1234" as numeric possitive integer', ->
          expect node ast('number: +1234'), 'expression.right.value' .to.be.equal 1234

        it 'should parse "-183" as numeric signed off integer', ->
          expect node ast('number: -183'), 'expression.right.value' .to.be.equal -183

        it 'should parse as "99.123" number literal', ->
          expect node ast('number: 99.123'), 'expression.right.value' .to.be.equal 99.123

        it 'should parse as "-99.123" as float signed off literal', ->
          expect node ast('number: -99.123'), 'expression.right.value' .to.be.equal -99.123

      describe 'boolean', (_) ->

        it 'should parse "boolean: yes" as boolean literal', ->
          expect node ast('boolean: yes'), 'expression.right.value' .to.be.true

        it 'should parse "boolean: false" as boolean literal', ->
          expect node ast('boolean: no'), 'expression.right.value' .to.be.false
          expect node ast('boolean: false'), 'expression.right.value' .to.be.false

        it 'should parse "false\\ntrue" as both boolean values', ->
          ast-tree = ast('false\ntrue')
          expect node ast-tree, '0.value' .to.be.equal false
          expect node ast-tree, '1.value' .to.be.equal true

      describe 'nil', (_) ->

        it 'should parse "null: nil" as nil literal', ->
          expect node ast('null: nil'), 'expression.right.value' .to.be.null

      describe 'mixed', (_) ->

        it 'should parse "1.1.3, true" as unquoted string', ->
          expect node ast('block: 1.2.1, true'), 'expression.right.value' .to.be.equal '1.2.1, true'

        it 'should parse "null: nil, 123" as interpolated literal', ->
          expect node ast('null: nil 123'), 'expression.right.value' .to.be.equal 'nil 123'

    describe 'curly braces', (_) ->

      it 'should parse a braces block property', ->
        expect node ast('block: { another: value }'), 'expression.right.expression.right.value'
          .to.be.equal 'value'

    describe 'attributes', (_) ->

      it 'should parse a list block with attributes', ->
        ast-obj = ast '''
          block (one: yes, another: no):
            this is a
            list of
            strings
          end
        '''
        expect node ast-obj, 'expression.left.attributes.0.left.name' .to.be.equal 'one'
        expect node ast-obj, 'expression.left.attributes.1.left.name' .to.be.equal 'another'
        expect node ast-obj, 'expression.right.body.1.value' .to.be.equal 'list of'

      describe 'identifier attributes only', (_) ->

        it 'should parse a multi-line attributes identifier', ->
          ast-obj = ast '''
            init: yes
            block (one: yes, another: no)
            final: yes
          '''
          expect node ast-obj, '0.expression.left.id.name' .to.be.equal 'init'
          expect node ast-obj, '1.expression.left.attributes.0.left.name' .to.be.equal 'one'
          expect node ast-obj, '1.expression.left.attributes.1.left.name' .to.be.equal 'another'
          expect node ast-obj, '2.expression.left.id.name' .to.be.equal 'final'

        it 'should parse a multiple attributes only blocks', ->
          ast-obj = ast '''
            block (first: yes)
            another (second: yes)
            final: yes
          '''
          expect node ast-obj, '0.expression.left.attributes.0.left.name' .to.be.equal 'first'
          expect node ast-obj, '1.expression.left.attributes.0.left.name' .to.be.equal 'second'
          expect node ast-obj, '2.expression.left.id.name' .to.be.equal 'final'

        it 'should parse a multiple attributes only blocks with the same identifier', ->
          ast-obj = ast '''
            block (first: yes)
            block (second: yes)
            final: yes
          '''
          expect node ast-obj, '0.expression.left.attributes.0.left.name' .to.be.equal 'first'
          expect node ast-obj, '1.expression.left.attributes.0.left.name' .to.be.equal 'second'
          expect node ast-obj, '2.expression.left.id.name' .to.be.equal 'final'

    describe 'assignment', ->

      describe 'in-line', (_) ->

        it 'should parse "oli!" as string literal"', ->
          expect node ast('hello: "oli!" end'), 'expression.right.value'
            .to.be.equal 'oli!'

        it 'should parse "hello: yes end"', ->
          expect node ast('hello: yes end'), 'expression.right.value' .to.be.equal true

        it 'should parse "hello: 13.85 end"', ->
          expect node ast('hello: 13.85 end'), 'expression.right.value' .to.be.equal 13.85

        it 'should parse "hello: [ 1, 2 ] end"', ->
          expect node ast('hello: [ 1, 2 ] end'), 'expression.right.elements.0.value' .to.be.equal 1

        describe 'nested', (_) ->

          it 'should parse "hello: from: oli: lang: oli!"', ->
            path = 'expression.right.expression.right.expression.right.expression.right.value'
            expect node ast('hello: from: oli: lang: oli!'), path
              .to.be.equal 'oli!'

      describe 'multi-line', (_) ->

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
          path = 'expression.right.body.0.expression.right.body.0.expression.right.body.0.expression.right.value'
          expect node code, path .to.be.equal 'this is oli!'

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
          path = 'expression.right.body.0.expression.right.body.0.expression.right.body.2.value'
          expect node code, path .to.be.equal 'looks nice!'

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
          path = 'expression.right.body.0.expression.right.body.0.expression.right.body.2.value'
          expect node code, path .to.be.equal -3

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
          path = 'expression.right.body.0.expression.right.body.0.expression.right.body.3.value'
          expect node code, path .to.be.equal false

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
                value: [ 1, 2 ]
              end
            end
          end
          '''
          path = 'expression.right.body.0.expression.right.body.0.expression.right.body.3.elements.4.value'
          expect node code, path .to.be.equal 'pretty'

      describe 'pipe statement', (_) ->

        it 'should parse "block: | hello" as pipe statement', ->
          ast-obj = ast '''
            block:
              | hello
          '''
          expect node ast-obj, 'expression.right.body.0.body.value' .to.be.equal 'hello'

        it 'should parse "block: | hello | yes ..." as pipe statement', ->
          ast-obj = ast '''
            block:
              | hello
              | yes
              | 12.401
          '''
          expect node ast-obj, 'expression.right.body.0.body.value' .to.be.equal 'hello'
          expect node ast-obj, 'expression.right.body.1.body.value' .to.be.true
          expect node ast-obj, 'expression.right.body.2.body.value' .to.be.equal 12.401

        it 'should parse "block: | - 1, 2, 3 ..." as pipe statement', ->
          ast-obj = ast '''
            block:
              | - 1, 2, 3
              | [ 'hello', 'oli!' ]
          '''
          expect node ast-obj, 'expression.right.body.0.body.elements.0.value' .to.be.equal 1
          expect node ast-obj, 'expression.right.body.0.body.elements.2.value' .to.be.equal 3
          expect node ast-obj, 'expression.right.body.1.body.elements.1.value' .to.be.equal 'oli!'

        it 'should parse "block: | yes block: true" as interpolated pipe statement', ->
          ast-obj = ast '''
            block:
              | yes
            another: true
          '''
          expect node ast-obj, '0.expression.right.body.0.body.value' .to.be.true
          expect node ast-obj, '1.expression.right.value' .to.be.true

        it 'should parse "block: another: | true" as nested pipe statement', ->
          ast-obj = ast '''
            block:
              another:
                | true
            end
          '''
          expect node ast-obj, 'expression.right.body.0.expression.right.body.0.body.value' .to.be.true

        it 'should parse "block: | another: | true" as block nested pipe statements', ->
          ast-obj = ast '''
            block:
              | another:
                | true
                | cool
          '''
          expect node ast-obj, 'expression.right.body.0.body.expression.right.body.0.body.value' .to.be.true
          expect node ast-obj, 'expression.right.body.0.body.expression.right.body.1.body.value' .to.be.equal 'cool'

        it 'should parse "block: | another: | nested: true end" as block nested pipe statements', ->
          ast-obj = ast '''
            block:
              | another:
                | nested:
                    true
                  end
              | cool
            final: block
          '''
          expect node ast-obj, '0.expression.right.body.0.body.expression.right.body.0.body.expression.right.body.0.value' .to.be.true
          expect node ast-obj, '0.expression.right.body.0.body.expression.right.body.1.body.value' .to.be.equal 'cool'
          expect node ast-obj, '1.expression.right.value' .to.be.equal 'block'

      describe 'multi-statement', (_) ->

        it 'first level primitives types', ->
          ast-obj = ast '''
          true no
          yes
          123.2313
          'hello oli!'
          string literal
          [ 1, 2, 'hello' ]
          '''
          expect node ast-obj, '0.value' .to.be.equal 'true no'
          expect node ast-obj, '1.value' .to.be.equal true
          expect node ast-obj, '2.value' .to.be.equal 123.2313
          expect node ast-obj, '3.value' .to.be.equal 'hello oli!'
          expect node ast-obj, '4.value' .to.be.equal 'string literal'
          expect node ast-obj, '5.elements.2.value' .to.be.equal 'hello'

        it 'should parse first-level expressions', ->
          ast-obj = ast '''
          hello:
            world: true
            'string'
            yes
          end
          another block: 'cool'
          final block: yes
          list: [
            test: hi
          ]
          '''
          expect node ast-obj, '0.expression.right.body.1.value' .to.be.equal 'string'
          expect node ast-obj, '1.expression.right.value' .to.be.equal 'cool'
          expect node ast-obj, '2.expression.right.value' .to.be.equal true

        it 'should parse multiple mixed types statements', ->
          ast-obj = ast '''
          hello:
            using: 'string'
            yes
          end
          nested: block: hello!
          final block: yes
          no
          123.41
          love it: yes
          '''
          expect node ast-obj, '0.expression.right.body.0.expression.right.value' .to.be.equal 'string'
          expect node ast-obj, '1.expression.right.expression.right.value' .to.be.equal 'hello!'
          expect node ast-obj, '2.expression.right.value' .to.be.equal true
          expect node ast-obj, '3.value' .to.be.equal false
          expect node ast-obj, '4.value' .to.be.equal 123.41
          expect node ast-obj, '5.expression.right.value' .to.be.equal true

        describe 'interpolated lists', (_) ->

          it 'should parser property a list of strings', ->
            ast-obj = ast '''
            hello: world
            list: - this, is, a, list
            another: block
            '''
            expect node ast-obj, '0.expression.right.value' .to.be.equal 'world'
            expect node ast-obj, '1.expression.right.elements.0.value' .to.be.equal 'this'
            expect node ast-obj, '1.expression.right.elements.3.value' .to.be.equal 'list'
            expect node ast-obj, '2.expression.right.value' .to.be.equal 'block'

          it 'should parser property a list of values blocks', ->
            ast-obj = ast '''
            hello: world
            list: - this, { oli: rules }, yes
            another: block
            '''
            expect node ast-obj, '0.expression.right.value' .to.be.equal 'world'
            expect node ast-obj, '1.expression.right.elements.0.value' .to.be.equal 'this'
            expect node ast-obj, '1.expression.right.elements.1.expression.right.value' .to.be.equal 'rules'
            expect node ast-obj, '1.expression.right.elements.2.value' .to.be.true
            expect node ast-obj, '2.expression.right.value' .to.be.equal 'block'

    describe 'assignment operators', ->

      describe 'empty (!:)', (_) ->

        it 'should parse "empty!:" as empty block', ->
          ast-obj = node ast('empty!:'), 'expression'
          expect node ast-obj, 'operator' .to.be.equal '!:'
          expect node ast-obj, 'left.id.name' .to.be.equal 'empty'
          expect node ast-obj, 'right' .to.be.null

        it 'should parse "empty!: \'text\'" as empty block', ->
          ast-obj = node ast('empty!: "text"'), 'expression'
          expect node ast-obj, 'operator' .to.be.equal '!:'
          expect node ast-obj, 'left.id.name' .to.be.equal 'empty'
          expect node ast-obj, 'right' .to.be.null

        it 'should parse "empty!: \'text\' end" as empty block', ->
          ast-obj = node ast('empty!: "text" end'), 'expression'
          expect node ast-obj, 'operator' .to.be.equal '!:'
          expect node ast-obj, 'left.id.name' .to.be.equal 'empty'
          expect node ast-obj, 'right' .to.be.null

      describe 'unfold (:=)', (_) ->

        it 'should parse in-line block', ->
          ast-obj = node ast('block:= hello!'), 'expression'
          expect node ast-obj, 'operator' .to.be.equal ':='
          expect node ast-obj, 'left.id.name' .to.be.equal 'block'
          expect node ast-obj, 'right.body.value' .to.be.equal 'hello!'
          expect node ast-obj, 'right.body.template' .to.be.true

        it 'should parse in-line block with end terminator', ->
          ast-obj = node ast('block:= "string" end'), 'expression'
          expect node ast-obj, 'operator' .to.be.equal ':='
          expect node ast-obj, 'left.id.name' .to.be.equal 'block'
          expect node ast-obj, 'right.body.value' .to.be.equal '"string"'
          expect node ast-obj, 'right.body.template' .to.be.true

        it 'should parse multi-line string block with end terminator', ->
          ast-obj = ast '''
          block:=
            "string"
              this is a
                multi-line \\end string
          end
          '''
          expect node ast-obj, 'expression.operator' .to.be.equal ':='
          expect node ast-obj, 'expression.left.id.name' .to.be.equal 'block'
          expect node ast-obj, 'expression.right.body.value'
            .to.be.equal '"string"\n    this is a\n      multi-line end string'

      describe 'fold (:-)', (_) ->

        it 'should parse in-line block', ->
          ast-obj = node ast('block:- hello!'), 'expression'
          expect node ast-obj, 'operator' .to.be.equal ':-'
          expect node ast-obj, 'left.id.name' .to.be.equal 'block'
          expect node ast-obj, 'right.body.value' .to.be.equal 'hello!'
          expect node ast-obj, 'right.body.template' .to.be.true

        it 'should parse in-line block with end terminator', ->
          ast-obj = node ast('block:- string end'), 'expression'
          expect node ast-obj, 'operator' .to.be.equal ':-'
          expect node ast-obj, 'left.id.name' .to.be.equal 'block'
          expect node ast-obj, 'right.body.value' .to.be.equal 'string'
          expect node ast-obj, 'right.body.template' .to.be.true

        it 'should parse multi-line string block with end terminator', ->
          ast-obj = ast '''
          block:-
            "string"
              this is a
                multi-line \\end string
          end
          '''
          expect node ast-obj, 'expression.operator' .to.be.equal ':-'
          expect node ast-obj, 'expression.left.id.name' .to.be.equal 'block'
          expect node ast-obj, 'expression.right.body.value'
            .to.be.equal '"string"\n    this is a\n      multi-line end string'

      describe 'raw (:>)', (_) ->

        it 'should parse in-line raw block', ->
          ast-obj = node ast('block:> hello!'), 'expression'
          expect node ast-obj, 'operator' .to.be.equal ':>'
          expect node ast-obj, 'left.id.name' .to.be.equal 'block'
          expect node ast-obj, 'right.raw' .to.be.true
          expect node ast-obj, 'right.body.value' .to.be.equal 'hello!'

        it 'should parse in-line raw block with end terminator', ->
          ast-obj = node ast('block:> hello! end'), 'expression'
          expect node ast-obj, 'operator' .to.be.equal ':>'
          expect node ast-obj, 'left.id.name' .to.be.equal 'block'
          expect node ast-obj, 'right.raw' .to.be.true
          expect node ast-obj, 'right.body.value' .to.be.equal 'hello!'

        it 'should parse multi-line raw block', ->
          code = '''
          block:>
            hello: world
            using: oli
          end
          '''
          ast-obj = node ast(code), 'expression'
          expect node ast-obj, 'operator' .to.be.equal ':>'
          expect node ast-obj, 'left.id.name' .to.be.equal 'block'
          expect node ast-obj, 'right.raw' .to.be.true
          expect node ast-obj, 'right.body.value' .to.be.equal 'hello: world\n  using: oli'

        it 'should parse multi-line raw block with escape sequences', ->
          code = '''
          block:>
            hello: world
            using: \\end
          end
          '''
          ast-obj = node ast(code), 'expression'
          expect node ast-obj, 'operator' .to.be.equal ':>'
          expect node ast-obj, 'left.id.name' .to.be.equal 'block'
          expect node ast-obj, 'right.raw' .to.be.true
          expect node ast-obj, 'right.body.value' .to.be.equal 'hello: world\n  using: end'

      # experimental support, work in progress
      describe 'indentation', (_) ->

        ast-obj = ast '''
          block:
            hello:
              yes
              key: value
              this is oli
              nested:
                sample string!
                block 3:
                  yes
                  - no, 1, 2, 3
              raw:>
                if (foo) {
                  bar()
                }
              end
              text:-
                hello oli
                  this is a sample
                multi-line string
              another string # comment
            inner block:
              hi
              how are you?
          final block:
            this is a string
          '''

        it 'should have the hello block', ->
          expect node ast-obj, '0.expression.right.body.0.expression.left.id.name' .to.be.equal 'hello'

        it 'hello block should have the proper values', ->
          expect node ast-obj, '0.expression.right.body.0.expression.right.body.0.value' .to.be.true
          expect node ast-obj, '0.expression.right.body.0.expression.right.body.1.expression.right.value' .to.be.equal 'value'
          expect node ast-obj, '0.expression.right.body.0.expression.right.body.2.value' .to.be.equal 'this is oli'
