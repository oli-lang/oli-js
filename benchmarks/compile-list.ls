require! '../lib/oli'

module.exports =
  name: 'Parse lists'
  tests: [

    * name: 'Dash: numbers'
      fn: -> oli.parse '- 1, 2, 3, 4'

    * name: 'Dash: booleans'
      fn: -> oli.parse '- yes, no, true, false'

    * name: 'Dash: strings'
      fn: -> oli.parse '- hello, world, with, oli'

    * name: 'Dash: quoted string'
      fn: -> oli.parse '- "hello", "world", "with", "oli"'

    * name: 'Brackets: numbers'
      fn: -> oli.parse '[1, 2, 3, 4]'

    * name: 'Brackets: booleans'
      fn: -> oli.parse '[ yes, no, true, false ]'

    * name: 'Brackets: strings'
      fn: -> oli.parse '[ hello, world, with, oli ]'

    * name: 'Brackets: quoted string'
      fn: -> oli.parse '["hello", "world", "with", "oli"]'

  ]
