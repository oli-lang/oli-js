{
  ast
  node
  expect
  inspect
} = require './lib/helper'

describe 'Primitive types', ->

  describe 'boolean', (_) ->

    it 'should parse "true" as boolean literal', ->
      expect node ast('yes'), 'value' .to.be.true
      expect node ast('true'), 'value' .to.be.true

    it 'should parse "false" as boolean literal', ->
      expect node ast('no'), 'value' .to.be.false
      expect node ast('false'), 'value' .to.be.false

  describe 'number', (_) ->

    it 'should parse "12" as numeric integer', ->
      expect node ast('12'), 'value' .to.be.equal 12

    it 'should parse "+1234" as numeric possitive integer', ->
      expect node ast('+1234'), 'value' .to.be.equal 1234

    it 'should parse "-183" as numeric signed off integer', ->
      expect node ast('-183'), 'value' .to.be.equal -183

    it 'should parse as "99.123" number literal', ->
      expect node ast('99.123'), 'value' .to.be.equal 99.123

    it 'should parse as "-99.123" as float signed off literal', ->
      expect node ast('-99.123'), 'value' .to.be.equal -99.123

  describe 'string', (_) ->

    it 'should parse "hello oli!" as string', ->
      expect node ast('"hello oli!"'), 'value' .to.be.equal 'hello oli!'

    it 'should parse "hello oli!" as string with single quotes', ->
      expect node ast("'hello oli!'"), 'value' .to.be.equal 'hello oli!'

    it 'should parse "hello \'oli!" as string with escape character', ->
      expect node ast("'hello \\'oli!'"), 'value' .to.be.equal 'hello \'oli!'

    it 'should parse "hello, oli!" as unquoted string', ->
      expect node ast('"hello, oli!"'), 'value' .to.be.equal 'hello, oli!'

    describe 'unquoted', (_) ->

      it 'should parse "hello oli!" as unquoted string', ->
        expect node ast('hello oli!'), 'value' .to.be.equal 'hello oli!'

      it 'should parse "oli, sintax, is pretty!" as unquoted string', ->
        expect node ast('oli, sintax, is pretty!'), 'value'
          .to.be.equal 'oli, sintax, is pretty!'

