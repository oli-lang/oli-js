{
  ast
  node
  expect
  inspect
} = require './lib/helper'

describe 'Expressions', ->

  describe 'reference', (_) ->

    it 'should parse "*value" as reference expression', ->
      expect node ast('*value'), 'name' .to.be.equal 'value'

    it 'should parse "*{value}" as reference expression', ->
      expect node ast('*{value}'), 'name' .to.be.equal 'value'

    it 'should parse "*\'value\'" as reference expression', ->
      expect node ast('*"value"'), 'name' .to.be.equal 'value'

    it 'should parse "*this.is.a.value" as dot member access reference', ->
      expect node ast('*this.is.a.value'), 'name' .to.be.equal 'this.is.a.value'

    it 'should parse "*{this.is.a.value}" as dot member access reference', ->
      expect node ast('*{this.is.a.value}'), 'name' .to.be.equal 'this.is.a.value'

    it 'should parse "block: *value" as reference expression', ->
      expect node ast('block: *value'), 'expression.right.name' .to.be.equal 'value'

    it 'should parse "block: *value end" as reference expression', ->
      ast-obj = ast('''
        block:
          *value
        end
      ''')
      expect node ast-obj, 'expression.right.body.0.name' .to.be.equal 'value'

    describe 'interpolated expression', (_) ->

      it 'should parse "*value text" as string literal', ->
        expect node ast('*value text'), 'value' .to.be.equal '*value text'

      it 'should parse "text *value" as string literal', ->
        expect node ast('text *value'), 'value' .to.be.equal 'text *value'

      it 'should parse "block: *value hello!" as string literal', ->
        expect node ast('block: *value hello!'), 'expression.right.value'
          .to.be.equal '*value hello!'

      it 'should parse "block: *value hello!" as string literal', ->
        expect node ast('block: *value hello!'), 'expression.right.value'
          .to.be.equal '*value hello!'

  describe 'list', ->

    describe 'brackets', (_) ->

      it 'should parse a list of numbers', ->
        expect node ast('[ 1, 2, 3 ]'), 'elements.1.value' .to.be.equal 2
        expect node ast('[ 1, 2, 3 ]'), 'elements.2.value' .to.be.equal 3

      it 'should parse a list of strings', ->
        expect node ast('[ hello oli!, it is, "cool" ]'), 'elements.0.value'
          .to.be.equal 'hello oli!'
        expect node ast('[ hello oli!, it is, "cool" ]'), 'elements.2.value'
          .to.be.equal 'cool'

      it 'should parse a list of booleans', ->
        expect node ast('[ yes, true, no, nil ]'), 'elements.2.value'
          .to.be.equal false

      it 'should parse a list with inner blocks', ->
        ast-obj = ast '''[
          pretty: yes
          oli: rules!
        ]'''
        expect node ast-obj, 'elements.0.expression.right.value'
          .to.be.equal true
        expect node ast-obj, 'elements.1.expression.right.value'
          .to.be.equal 'rules!'

    describe 'dash', (_) ->

      it 'should parse a list of numbers', ->
        expect node ast('- 1, 2, 3'), 'elements.1.value' .to.be.equal 2
        expect node ast('- 1, 2, 3'), 'elements.2.value' .to.be.equal 3

      it 'should parse a list of strings', ->
        expect node ast('- hello oli!, it is, "cool"'), 'elements.0.value'
          .to.be.equal 'hello oli!'
        expect node ast('- hello oli!, it is, "cool"'), 'elements.2.value'
          .to.be.equal 'cool'

      it 'should parse a list of booleans', ->
        expect node ast('- yes, true, no'), 'elements.2.value'
          .to.be.equal false

      it 'should parse a list with a value block statement', ->
        expect node ast('- hello: world'), 'elements.0.expression.right.value'
          .to.be.equal 'world'

      it 'should parse a list of multiple value statements', ->
        ast-obj = ast '- { hello: world }, { using: oli }, yes'
        expect node ast-obj, 'elements.0.expression.right.value' .to.be.equal 'world'
        expect node ast-obj, 'elements.1.expression.right.value' .to.be.equal 'oli'
        expect node ast-obj, 'elements.2.value' .to.be.true

  describe 'comments', ->

    describe 'in-line', (_) ->

      it 'should ignore the comment on parsing', ->
        expect ast('# this is a comment!').body .to.have.length 0

      it 'should parse properly with a the interpolated comment', ->
        expect node ast('hello: world # comment!'), 'expression.right.value'
          .to.be.equal 'world'

      it 'should parse properly with higher comment', ->
        ast-obj = ast('''
          # comment!
          oli!
        ''')
        expect node ast-obj, 'value' .to.be.equal 'oli!'

      it 'should parse block with interpolated comment', ->
        ast-obj = ast '''
          hello:
            # comment!
            world: using: oli # another comment
          end
        '''
        expect node ast-obj, 'expression.right.body.0.expression.right.expression.right.value'
          .to.be.equal 'oli'

    describe 'multi-line', (_) ->

      it 'should ignore the in-line comment on parsing', ->
        expect ast('## this is a comment! ##').body .to.have.length 0

      it 'should ignore the comment on parsing', ->
        expect ast('''##
          this is a comment!
        ##''').body .to.have.length 0

      it 'should not parse the first level comment', ->
        expect node ast('hello: world ## comment! ##'), 'expression.right.value'
          .to.be.equal 'world'

  describe 'identifier declaration', ->

    describe 'name', (_) ->

      it 'should parse "hello" as identifier', ->
        expect node ast('hello: "oli!"'), 'expression.left.id.name'
          .to.be.equal 'hello'

      it 'should parse "hello.oli" as identifier', ->
        expect node ast('hello.oli: "hola"'), 'expression.left.id.name'
          .to.be.equal 'hello.oli'

      it 'should parse "hello-oli" as identifier', ->
        expect node ast('hello-oli: "hola"'), 'expression.left.id.name'
          .to.be.equal 'hello-oli'

      it 'should parse "hello oli" as reference identifier ', ->
        expect node ast('hello oli: "hola"'), 'expression.left.id.name'
          .to.be.equal 'hello oli'

      it 'should parse "hello - world . oli" as reference identifier ', ->
        expect node ast('hello - world . oli: "hola"'), 'expression.left.id.name'
          .to.be.equal 'hello - world . oli'

      it 'should parse "%hello world oli%" as reference identifier ', ->
        expect node ast('%hello world oli%: "hola"'), 'expression.left.id.name'
          .to.be.equal '%hello world oli%'

      it 'should parse "(hello world oli)" as reference identifier ', ->
        expect node ast('(hello world oli): "hola"'), 'expression.left.id.name'
          .to.be.equal 'hello world oli'

      it 'should parse "(\'hello world oli\')" as reference identifier ', ->
        expect node ast('("hello world oli"): "hola"'), 'expression.left.id.value'
          .to.be.equal 'hello world oli'

      it 'should parse "\'hello world oli\'" as reference identifier ', ->
        expect node ast('"hello world oli": "hola"'), 'expression.left.id.value'
          .to.be.equal 'hello world oli'

    describe 'reference', (_) ->

      it 'should parse "*{block}: value" as block identifier', ->
        expect node ast('*{block}: value'), 'expression.left.id.name' .to.be.equal 'block'
        expect node ast('*{block}: value'), 'expression.right.value' .to.be.equal 'value'

      it 'should parse "*block: value" as block identifier', ->
        expect node ast('*block: value'), 'expression.left.id.name' .to.be.equal 'block'
        expect node ast('*block: value'), 'expression.right.value' .to.be.equal 'value'

    describe 'reference alias', (_) ->

      it 'should parse "oli" as reference identifier', ->
        ast-obj = node ast('hello > oli: "hola"'), 'expression.left.expression'
        expect node ast-obj, 'argument.name' .to.be.equal 'oli'
        expect node ast-obj, 'operator' .to.be.equal '>'

      it 'should parse "oli rules" as reference identifier', ->
        expect node ast('hello > oli rules: "hola"'), 'expression.left.expression.argument.name'
          .to.be.equal 'oli rules'

      it 'should parse "(oli rules)" as reference identifier', ->
        expect node ast('hello > (oli rules): "hola"'), 'expression.left.expression.argument.name'
          .to.be.equal 'oli rules'

      it 'should parse "\'oli rules\'" as reference identifier', ->
        expect node ast('hello > "oli rules": "hola"'), 'expression.left.expression.argument.value'
          .to.be.equal 'oli rules'

      describe 'negation', (_) ->

        it 'should parse "hello" as reference identifier', ->
          expect node ast('hello !> oli rules: "hola"'), 'expression.left.id.name'
            .to.be.equal 'hello'

        it 'should parse "\'oli rules\'" as reference identifier', ->
          expect node ast('hello !> "oli rules": "hola"'), 'expression.left.expression.argument.value'
            .to.be.equal 'oli rules'

    describe 'reference alias with ampersand', (_) ->

      it 'should parse "&oli" as reference identifier', ->
        ast-obj = node ast('&oli: "hola"'), 'expression.left'
        expect node ast-obj, 'id.argument.name' .to.be.equal 'oli'
        expect node ast-obj, 'id.operator' .to.be.equal '&'

      it 'should parse "&hello oli" as reference identifier', ->
        expect node ast('&hello oli: "hola"'), 'expression.left.id.argument.name'
          .to.be.equal 'hello oli'

      it 'should parse "&\'hello oli\'" as reference identifier', ->
        expect node ast('&"hello oli": "hola"'), 'expression.left.id.argument.value'
          .to.be.equal 'hello oli'

      describe 'negation', (_) ->

        it 'should parse "!&hello oli" as reference identifier', ->
          expect node ast('!&hello oli: "hola"'), 'expression.left.id.argument.name'
            .to.be.equal 'hello oli'

        it 'should parse "!&\'hello oli\'" as reference identifier', ->
          expect node ast('!&"hello oli": "hola"'), 'expression.left.id.argument.value'
            .to.be.equal 'hello oli'

    describe 'clone', (_) ->

      it 'should parse "yaml" as clone identifier', ->
        expect node ast('oli >> yaml: "hola"'), 'expression.left.expression.argument.name'
          .to.be.equal 'yaml'

      it 'should parse "yaml also rules" as clone identifier', ->
        expect node ast('oli >> yaml also rules: "hola"'), 'expression.left.expression.argument.name'
          .to.be.equal 'yaml also rules'

      it 'should parse "\'yaml also rules\'" as clone identifier', ->
        expect node ast('oli >> "yaml also rules": "hola"'), 'expression.left.expression.argument.value'
          .to.be.equal 'yaml also rules'

      it 'should parse "(yaml also rules)" as clone identifier', ->
        expect node ast('oli >> (yaml also rules): "hola"'), 'expression.left.expression.argument.name'
          .to.be.equal 'yaml also rules'

      describe 'multiple expressions', (_) ->

        it 'should should parse ">> language >> markup"', ->
          ast-obj = ast('oli >> language >> markup: cool')
          expect node ast-obj, 'expression.left.expression.0.argument.name' .to.be.equal 'language'
          expect node ast-obj, 'expression.left.expression.1.argument.name' .to.be.equal 'markup'

    describe 'merge', (_) ->

      it 'should parse "yaml" as merge identifier', ->
        expect node ast('oli >>> yaml: "hola"'), 'expression.left.expression.argument.name'
          .to.be.equal 'yaml'

      it 'should parse "yaml also rules" as merge identifier', ->
        expect node ast('oli >>> yaml also rules: "hola"'), 'expression.left.expression.argument.name'
          .to.be.equal 'yaml also rules'

      it 'should parse "\'yaml also rules\'" as merge identifier', ->
        expect node ast('oli >>> "yaml also rules": "hola"'), 'expression.left.expression.argument.value'
          .to.be.equal 'yaml also rules'

      it 'should parse "(yaml also rules)" as merge identifier', ->
        expect node ast('oli >>> (yaml also rules): "hola"'), 'expression.left.expression.argument.name'
          .to.be.equal 'yaml also rules'

      describe 'multiple expressions', (_) ->

        it 'should should parse ">>> language >>> markup"', ->
          ast-obj = ast('oli >>> language >>> markup: cool')
          expect node ast-obj, 'expression.left.expression.0.argument.name' .to.be.equal 'language'
          expect node ast-obj, 'expression.left.expression.1.argument.name' .to.be.equal 'markup'

    describe 'reference + operation', (_) ->

      it 'should parse "oli" as identifier', ->
        expect node ast('oli >> rules > say: "hola"'), 'expression.left.id.name'
          .to.be.equal 'oli'

      it 'should parse "oli" as identifier', ->
        expect node ast('&oli >>> rules > say: "hola"'), 'expression.left.id.argument.name'
          .to.be.equal 'oli'

      it 'should parse "say" as reference identifier', ->
        ast-obj = node ast('oli >> rules > say: "hola"'), 'expression.left.expression.right'
        expect node ast-obj, 'argument.name' .to.be.equal 'say'
        expect node ast-obj, 'operator' .to.be.equal '>'

      it 'should parse "rules" as clone identifier', ->
        ast-obj = node ast('oli >> rules > say: "hola"'), 'expression.left.expression.left'
        expect node ast-obj, 'argument.name' .to.be.equal 'rules'
        expect node ast-obj, 'operator' .to.be.equal '>>'

      it 'should parse "rules" as merge identifier', ->
        ast-obj = node ast('oli >>> rules > say: "hola"'), 'expression.left.expression.left'
        expect node ast-obj, 'argument.name' .to.be.equal 'rules'
        expect node ast-obj, 'operator' .to.be.equal '>>>'

  describe 'attributes declaration', (_) ->

    it 'should parse "key" as unique attribute identifier', ->
      expect node ast('hello (key): oli'), 'expression.left.attributes.0.left.name'
        .to.be.equal 'key'

    it 'should parse "(key)" as unique attribute identifier', ->
      expect node ast('hello (key): oli'), 'expression.left.attributes.0.left.name'
        .to.be.equal 'key'

    it 'should parse "\'key\'" as unique attribute identifier', ->
      expect node ast('hello ("key"): oli'), 'expression.left.attributes.0.left.value'
        .to.be.equal 'key'

    it 'should parse "key" as attribute identifier', ->
      expect node ast('hello (key: value): oli'), 'expression.left.attributes.0.left.name'
        .to.be.equal 'key'

    it 'should parse "value" as attribute value', ->
      expect node ast('hello (key: value): oli'), 'expression.left.attributes.0.right.value'
        .to.be.equal 'value'

    it 'should parse "yes" as attribute boolean value', ->
      expect node ast('hello (key: yes): oli'), 'expression.left.attributes.0.right.value'
        .to.be.equal true

    it 'should parse "-12.2931" as attribute number value', ->
      expect node ast('hello (key: -12.2931): oli'), 'expression.left.attributes.0.right.value'
        .to.be.equal -12.2931

    it 'should parse "[ 1, no, 3 ]" as attribute number value', ->
      expect node ast('hello (key: [ 1, no, 3 ]): oli'), 'expression.left.attributes.0.right.elements.1.value'
        .to.be.equal false

    describe 'reference', (_) ->

      it 'should parse "hello (*key)" as attribute identifier reference', ->
        expect node ast('hello (*key): oli'), 'expression.left.attributes.0.left.name'
          .to.be.equal 'key'

      it 'should parse "hello (*{key}: value)" as attribute identifier reference', ->
        expect node ast('hello (*{key}: value): oli'), 'expression.left.attributes.0.left.name'
          .to.be.equal 'key'

      it 'should parse "hello (key: *value)" as attribute reference value', ->
        expect node ast('hello (key: *value): oli'), 'expression.left.attributes.0.right.name'
          .to.be.equal 'value'

      it 'should parse "hello (key: *\'value\')" as attribute reference value', ->
        expect node ast('hello (key: *"value"): oli'), 'expression.left.attributes.0.right.name'
          .to.be.equal 'value'

      it 'should parse "hello (key: value, another: *one)" as attribute reference value', ->
        expect node ast('hello (key: value, another: *one): oli'), 'expression.left.attributes.1.right.name'
          .to.be.equal 'one'

    describe 'list', (_) ->

      it 'should parse "super key" as unique attribute identifier', ->
        expect node ast('hello (key, super key): oli'), 'expression.left.attributes.1.left.name'
          .to.be.equal 'super key'

      it 'should parse "super key" as attribute identifier', ->
        expect node ast('hello (key: value, super key: super value): oli'), 'expression.left.attributes.1.left.name'
          .to.be.equal 'super key'

      it 'should parse "super value" as attribute assignment value', ->
        expect node ast('hello (key: value, super key: "super value"): oli'), 'expression.left.attributes.1.right.value'
          .to.be.equal 'super value'

    describe 'block attributes', (_) ->

      it 'should parse in-line block attributes', ->
        ast-obj = ast 'block (one: yes, another: false)'
        expect node ast-obj, 'expression.attributes.0.left.name' .to.be.equal 'one'
        expect node ast-obj, 'expression.attributes.1.left.name' .to.be.equal 'another'

