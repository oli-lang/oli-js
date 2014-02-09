{
  oli
  ast
  parse
  expect
  inspect
} = require './lib/helper'

describe 'Compiler', ->

  describe 'basic', (_) ->

    # testing
    xit 'should compile block properly', ->
      inspect parse '''
        # comment
        &pepe:
          mundo: feliz
          says: 'oli'
        end
        block >>> pepe > hola (hola: mundo):
          | universo: "hola como estas?: *name"
          | block: 'MUNDO'
          | mundo: 'grande'
        test: *hola
        block: jajajaja
        &name: oli
      '''
      process.exit!
      expect parse '''
        # comment
        block >>> "pepe" > hola (hola: mundo):
          | "hola *'mundo' como estas?"
          | *hola
        test: hola
      ''', { comments: true } .to.be.deep.equal [ 1, 2, 3 ]

    it 'should compile "value" as string', ->
      expect parse('value') .to.be.equal 'value'

    it 'should compile "12" as number', ->
      expect parse('12') .to.be.equal 12

    it 'should compile "12.3412" as decimal number', ->
      expect parse('12.3412') .to.be.equal 12.3412

    it 'should compile "-9.1" as signed off number', ->
      expect parse('-9.1') .to.be.equal -9.1

    it 'should compile "0xFFF" as signed off number', ->
      expect parse('0xFFF') .to.be.equal 4095

    it 'should compile "true" as boolean', ->
      expect parse('true') .to.be.true

    it 'should compile "no" as boolean', ->
      expect parse('no') .to.be.false

  describe 'lists', (_) ->

    it 'should compile "- 1, 2, 3" as in-line list', ->
      expect parse('- 1, 2, 3') .to.be.deep.equal [ 1, 2, 3 ]

    it 'should compile "[ "test" ]" as in-line list', ->
      expect parse('block: - 1 ,2, 3').block.body .to.be.deep.equal [ 1, 2, 3 ]


