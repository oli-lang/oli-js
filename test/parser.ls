{
  node
  parse
  expect
  inspect
} = require './lib/helper'

describe 'Parser', ->

  describe 'testing', (_) ->

    xit 'should parse property', ->
      inspect parse('''
        block:
          another:
            nested:
              list:
                - 1, 2, 3
              end
            end
            yes
          end
        end
      ''')
      expect parse('block: value') .to.be.null
