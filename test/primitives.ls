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

  describe 'nil', (_) ->

    it 'should parse "nil" as nil literal', ->
      expect node ast('nil'), 'value' .to.be.null

  describe 'number', (_) ->

    it 'should parse "12" as numeric integer', ->
      expect node ast('12'), 'value' .to.be.equal 12

    it 'should parse "+1234" as numeric possitive integer', ->
      expect node ast('+1234'), 'value' .to.be.equal 1234

    it 'should parse "-183" as numeric signed off integer', ->
      expect node ast('-183'), 'value' .to.be.equal -183

    it 'should parse "99.123" as number literal', ->
      expect node ast('99.123'), 'value' .to.be.equal 99.123

    it 'should parse "-99.123" as float signed off literal', ->
      expect node ast('-99.123'), 'value' .to.be.equal -99.123

    describe 'hexadecimal', (_) ->

      it 'should parse "0xFFFFFFFF" as number', ->
        expect node ast('0xFFFFFFFF'), 'value' .to.be.equal 0xFFFFFFFF
        expect node ast('0xFFFFFFFF'), 'raw' .to.be.equal 'FFFFFFFF'

      it 'should parse "0x696969" as number', ->
        expect node ast('0x696969'), 'value' .to.be.equal 0x696969
        expect node ast('0x696969'), 'raw' .to.be.equal '696969'

  describe 'string', (_) ->

    it 'should parse "" as empty quoted string', ->
      expect node ast('""'), 'value' .to.be.equal ''

    it 'should parse "hello oli!" as string', ->
      expect node ast('"hello oli!"'), 'value' .to.be.equal 'hello oli!'
      expect node ast('"hello oli!"'), 'template' .to.be.true

    it 'should parse "hello oli!" as string with single quotes', ->
      expect node ast("'hello oli!'"), 'value' .to.be.equal 'hello oli!'
      expect node ast("'\"hello oli!\"'"), 'template' .to.be.false

    it 'should parse "hello \'oli!" as string with escape character', ->
      expect node ast("'hello \\'oli!'"), 'value' .to.be.equal 'hello \'oli!'

    it 'should parse "hello, oli!" as unquoted string', ->
      expect node ast('hello, oli!'), 'value' .to.be.equal 'hello, oli!'

    describe 'unquoted', (_) ->

      it 'should parse "hello oli!" as unquoted string', ->
        expect node ast('hello oli!'), 'value' .to.be.equal 'hello oli!'

      it 'should parse "oli, sintax, is pretty!" as unquoted string', ->
        expect node ast('oli, sintax, is pretty!'), 'value'
          .to.be.equal 'oli, sintax, is pretty!'

  describe 'interporaled', (_) ->

    it 'should parse "yes, string" as unquoted string', ->
      expect node ast('yes, string'), '0.value' .to.be.true
      expect node ast('yes, string'), '1.value' .to.be.equal ', string'

    it 'should parse "1.1.3, true" as unquoted string', ->
      expect node ast('1.2.1, true'), 'value' .to.be.equal '1.2.1, true'

