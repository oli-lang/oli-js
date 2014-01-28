{
  ast
  node
  expect
  inspect
} = require './lib/helper'

describe 'Expressions', ->

  describe 'lists', ->

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
        expect node ast('[ yes, true, no ]'), 'elements.2.value'
          .to.be.equal false

      it 'should parse a list with inner blocks', ->
        ast-obj = ast '''[
          pretty: yes
          oli: rules!
        ]'''
        expect node ast-obj, 'elements.0.body.0.value'
          .to.be.equal true
        expect node ast-obj, 'elements.1.body.0.value'
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

      it 'should parse a list of booleans', ->
        expect node ast('- hello: world'), 'elements.0.body.0.value'
          .to.be.equal 'world'

  describe 'comments', ->

    describe 'in-line', (_) ->

      it 'should ignore the comment on parsing', ->
        expect ast('# this is a comment!').body .to.have.length 0

      it 'should not parse the interpolated comment', ->
        expect node ast('hello: world # comment!'), 'body.0.value'
          .to.be.equal 'world'

    describe 'multi-line', (_) ->

      it 'should ignore the in-line comment on parsing', ->
        expect ast('## this is a comment! ##').body .to.have.length 0

      it 'should ignore the comment on parsing', ->
        expect ast('''##
          this is a comment!
        ##''').body .to.have.length 0

      it 'should not parse the first level comment', ->
        expect node ast('hello: world ## comment! ##'), 'body.0.value'
          .to.be.equal 'world'

  describe 'identifier declaration', ->

    describe 'name', (_) ->

      it 'should parse "hello" as identifier', ->
        expect node ast('hello: "oli!"'), 'id.name'
          .to.be.equal 'hello'

      it 'should parse "hello.oli" as identifier', ->
        expect node ast('hello.oli: "hola"'), 'id.name'
          .to.be.equal 'hello.oli'

      it 'should parse "hello-oli" as identifier', ->
        expect node ast('hello-oli: "hola"'), 'id.name'
          .to.be.equal 'hello-oli'

      it 'should parse "hello oli" as reference identifier ', ->
        expect node ast('hello oli: "hola"'), 'id.name'
          .to.be.equal 'hello oli'

      it 'should parse "hello  world  oli" as reference identifier ', ->
        expect node ast('hello  world  oli: "hola"'), 'id.name'
          .to.be.equal 'hello  world  oli'

      it 'should parse "\'hello  world  oli\'" as reference identifier ', ->
        expect node ast('"hello  world  oli": "hola"'), 'id.name'
          .to.be.equal 'hello  world  oli'

    describe 'reference alias', (_) ->

      it 'should parse "oli" as reference identifier', ->
        expect node ast('hello > oli: "hola"'), 'id.reference.name'
          .to.be.equal 'oli'

      it 'should parse "oli rules" as reference identifier', ->
        expect node ast('hello > oli rules: "hola"'), 'id.reference.name'
          .to.be.equal 'oli rules'

      it 'should parse "\'oli rules\'" as reference identifier', ->
        expect node ast('hello > "oli rules": "hola"'), 'id.reference.name'
          .to.be.equal 'oli rules'

      describe 'negation', (_) ->

        it 'should parse "oli rules" as reference identifier', ->
          expect node ast('hello !> oli rules: "hola"'), 'id.reference.name'
            .to.be.equal 'oli rules'

        it 'should parse "\'oli rules\'" as reference identifier', ->
          expect node ast('hello !> "oli rules": "hola"'), 'id.reference.name'
            .to.be.equal 'oli rules'

    describe 'reference alias with ampersand', (_) ->

      it 'should parse "@oli" as reference identifier', ->
        expect node ast('@oli: "hola"'), 'id.reference.name'
          .to.be.equal 'oli'

      it 'should parse "@hello oli" as reference identifier', ->
        expect node ast('@hello oli: "hola"'), 'id.reference.name'
          .to.be.equal 'hello oli'

      it 'should parse "@\'hello oli\'" as reference identifier', ->
        expect node ast('@"hello oli": "hola"'), 'id.reference.name'
          .to.be.equal 'hello oli'

      describe 'negation', (_) ->

        it 'should parse "!@hello oli" as reference identifier', ->
          expect node ast('!@hello oli: "hola"'), 'id.reference.name'
            .to.be.equal 'hello oli'

        it 'should parse "!@\'hello oli\'" as reference identifier', ->
          expect node ast('!@"hello oli": "hola"'), 'id.reference.name'
            .to.be.equal 'hello oli'

    describe 'clone', (_) ->

      it 'should parse "yaml" as clone identifier', ->
        expect node ast('oli >> yaml: "hola"'), 'id.operation.name'
          .to.be.equal 'yaml'

      it 'should parse "yaml also rules" as clone identifier', ->
        expect node ast('oli >> yaml also rules: "hola"'), 'id.operation.name'
          .to.be.equal 'yaml also rules'

      it 'should parse "\'yaml also rules\'" as clone identifier', ->
        expect node ast('oli >> "yaml also rules": "hola"'), 'id.operation.name'
          .to.be.equal 'yaml also rules'

    describe 'merge', (_) ->

      it 'should parse "yaml" as merge identifier', ->
        expect node ast('oli >>> yaml: "hola"'), 'id.operation.name'
          .to.be.equal 'yaml'

      it 'should parse "yaml also rules" as merge identifier', ->
        expect node ast('oli >>> yaml also rules: "hola"'), 'id.operation.name'
          .to.be.equal 'yaml also rules'

      it 'should parse "\'yaml also rules\'" as merge identifier', ->
        expect node ast('oli >>> "yaml also rules": "hola"'), 'id.operation.name'
          .to.be.equal 'yaml also rules'

    describe 'reference + operation', (_) ->

      it 'should parse "oli" as identifier', ->
        expect node ast('oli >> rules > say: "hola"'), 'id.name'
          .to.be.equal 'oli'

      it 'should parse "say" as reference identifier', ->
        expect node ast('oli >> rules > say: "hola"'), 'id.reference.name'
          .to.be.equal 'say'

      it 'should parse "rules" as merge identifier', ->
        expect node ast('oli >> rules > say: "hola"'), 'id.operation.name'
          .to.be.equal 'rules'

      it 'should parse "rules" as clone identifier', ->
        expect node ast('oli >>> rules > say: "hola"'), 'id.operation.name'
          .to.be.equal 'rules'

      it 'should parse "oli" as clone identifier', ->
        expect node ast('@oli >>> rules > say: "hola"'), 'id.reference.name'
          .to.be.equal 'oli'

  describe 'copy declaration', (_) ->

    it 'should parse "hello" as identifier', ->
      expect node ast('hello:> oli'), 'id.name'
        .to.be.equal 'hello'

    it 'should parse "oli" as source identifier', ->
      expect node ast('hello:> oli'), 'source.name'
        .to.be.equal 'oli'

    it 'should parse "use this language" as reference identifier', ->
      expect node ast('hello:> use this language'), 'source.name'
        .to.be.equal 'use this language'

    it 'should parse "\'this language rules\'" as reference identifier', ->
      expect node ast('hello:> "this language rules"'), 'source.name'
        .to.be.equal 'this language rules'

  describe 'attributes declaration', (_) ->

    it 'should parse "key" as unique attribute identifier', ->
      expect node ast('hello (key): oli'), 'id.attributes.0.left.value'
        .to.be.equal 'key'

    it 'should parse "key" as attribute identifier', ->
      expect node ast('hello(key: value): oli'), 'id.attributes.0.left.value'
        .to.be.equal 'key'

    it 'should parse "value" as attribute value', ->
      expect node ast('hello(key: value): oli'), 'id.attributes.0.right.value'
        .to.be.equal 'value'

    it 'should parse "yes" as attribute boolean value', ->
      expect node ast('hello(key: yes): oli'), 'id.attributes.0.right.value'
        .to.be.equal true

    it 'should parse "-12.2931" as attribute number value', ->
      expect node ast('hello(key: -12.2931): oli'), 'id.attributes.0.right.value'
        .to.be.equal -12.2931

    it 'should parse "[ 1, no, 3 ]" as attribute number value', ->
      expect node ast('hello(key: [ 1, no, 3 ]): oli'), 'id.attributes.0.right.elements.1.value'
        .to.be.equal false

    describe 'list', (_) ->

      it 'should parse "super key" as unique attribute identifier', ->
        expect node ast('hello (key, super key): oli'), 'id.attributes.1.left.value'
          .to.be.equal 'super key'

      it 'should parse "super key" as attribute identifier', ->
        expect node ast('hello(key: value, super key: super value): oli'), 'id.attributes.1.left.value'
          .to.be.equal 'super key'

      it 'should parse "super value" as attribute identifier', ->
        expect node ast('hello (key: value, super key: super value): oli'), 'id.attributes.1.right.value'
          .to.be.equal 'super value'
