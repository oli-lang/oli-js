{
  ast
  node
  expect
  inspect
} = require './lib/helper'

describe 'Expressions', ->

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

    describe 'reference alias with ampersand', (_) ->

      it 'should parse "&oli" as reference identifier', ->
        expect node ast('&oli: "hola"'), 'id.reference.name'
          .to.be.equal 'oli'

      it 'should parse "&hello oli" as reference identifier', ->
        expect node ast('&hello oli: "hola"'), 'id.reference.name'
          .to.be.equal 'hello oli'

      it 'should parse "&\'hello oli\'" as reference identifier', ->
        expect node ast('&"hello oli": "hola"'), 'id.reference.name'
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
        expect node ast('&oli >>> rules > say: "hola"'), 'id.reference.name'
          .to.be.equal 'oli'
