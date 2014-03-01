require! '../lib/oli'

module.exports =
  name: 'Parse blocks'
  tests: [

    * name: 'Inline: numbers'
      fn: -> oli.parse 'block: 1, 2, 3, 4'

    * name: 'Inline: booleans'
      fn: -> oli.parse 'block: yes, no, true, false'

    * name: 'Inline: strings'
      fn: -> oli.parse '- hello, world, with, oli'

    * name: 'Inline: quoted string'
      fn: -> oli.parse '- "hello", "world", "with", "oli"'

    * name: 'Inline: quoted single line string'
      fn: -> oli.parse 'string: "this is a s@mpl3 string!!"'

    * name: 'Inline: unquoted single line string'
      fn: -> oli.parse 'string: "this is a s@mpl3 string!!"'

    * name: 'Inline: integer'
      fn: -> oli.parse 'number: 1234891238'

    * name: 'Inline: float'
      fn: -> oli.parse 'number: 123.923919'

    * name: 'Inline: float signed'
      fn: -> oli.parse 'number: +123.923919'

    * name: 'Inline: boolean'
      fn: -> oli.parse 'boolean: yes'

    * name: 'Inline: numbers'
      fn: -> oli.parse 'list: [1, 2, 3, 4]'

    * name: 'Inline: booleans'
      fn: -> oli.parse 'list: [ yes, no, true, false ]'

    * name: 'Inline: strings'
      fn: -> oli.parse 'list: [ hello, world, with, oli ]'

    * name: 'Inline: quoted string'
      fn: -> oli.parse 'list: ["hello", "world", "with", "oli"]'

    * name: 'Multi-line: boolean'
      fn: -> oli.parse '''
        block:
          true
          false
          no
          yes
        end
      '''

    * name: 'Multi-line: numbers'
      fn: -> oli.parse '''
        block:
          12
          2.3
          -23
          +93.1
        end
      '''

    * name: 'Multi-line: strings'
      fn: -> oli.parse '''
        block:
          "this is a sample string!!"
          "this is a another string!!"
          "this is a another string!!"
        end
      '''

    * name: 'Multi-line: list'
      fn: -> oli.parse '''
        block:
          - "string"
          - yes
          - 123
        end
      '''

    * name: 'Nested: strings'
      fn: -> oli.parse '''
        block:
          another:
            block:
              "this is a sample string!!"
            end
          end
        end
      '''

    * name: 'Nested: boolean'
      fn: -> oli.parse '''
        block:
          another:
            block:
              yes
              no
            end
          end
        end
      '''

    * name: 'Nested: number'
      fn: -> oli.parse '''
        block:
          another:
            block:
              12.5
              -42.9
            end
          end
        end
      '''

    * name: 'Nested: list'
      fn: -> oli.parse '''
        block:
          another:
            block:
              - 'string'
              - yes
            end
          end
        end
      '''
  ]

