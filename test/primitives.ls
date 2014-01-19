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

describe 'Primitive types', ->

  before -> generate-parser!

  describe 'boolean', (_) ->

    it 'should parse "true" as boolean literal', ->
      expect node ast('boolean: yes'), 'value.value' .to.be.true
      expect node ast('boolean: true'), 'value.value' .to.be.true

    it 'should parse "false" as boolean literal', ->
      expect node ast('boolean: no'), 'value.value' .to.be.false
      expect node ast('boolean: false'), 'value.value' .to.be.false

  describe 'number', (_) ->

    it 'should parse "12" as numeric integer', ->
      expect node ast('number: 12'), 'value.value' .to.be.equal 12

    it 'should parse "+1234" as numeric possitive integer', ->
      expect node ast('number: +1234'), 'value.value' .to.be.equal 1234

    it 'should parse "-183" as numeric signed off integer', ->
      expect node ast('number: -183'), 'value.value' .to.be.equal -183

    it 'should parse as "99.123" number literal', ->
      expect node ast('number: 99.123'), 'value.value' .to.be.equal 99.123

    it 'should parse as "-99.123" as float signed off literal', ->
      expect node ast('number: -99.123'), 'value.value' .to.be.equal -99.123

  describe 'string', (_) ->

    it 'should parse "hello oli!" as string', ->
      expect node ast('string: "hello oli!"'), 'value.value' .to.be.equal 'hello oli!'

    it 'should parse "hello oli!" as string with single quotes', ->
      expect node ast("string: 'hello oli!'"), 'value.value' .to.be.equal 'hello oli!'

    it 'should parse "hello \'oli!" as string with escape character', ->
      expect node ast("string: 'hello \\'oli!'"), 'value.value' .to.be.equal 'hello \'oli!'

    it 'should parse "hello, oli!" as unquoted string', ->
      #inspect ast('string: hello oli!')
      expect node ast('string: hello, oli!'), 'value.value' .to.be.equal 'hello, oli!'
      #expect node ast('string: pepe , hoho # jajaja'), 'value.value' .to.be.equal 'hello, oli!'

