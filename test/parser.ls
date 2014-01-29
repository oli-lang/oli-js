{
  node
  parse
  expect
  inspect
} = require './lib/helper'

describe 'Parser', ->

  describe 'testing', (_) ->

    it 'should parse property', ->
      expect parse('block: value') .to.have.property 'block'
