require! '../lib/oli'

module.exports = 
  name: 'Primitives'
  tests: [
    * name: 'String: quoted single line'
      fn: -> oli.parse 'string: "this is a s@mpl3 string!!"'
    * name: 'String: unquoted single line'
      fn: -> oli.parse 'string: "this is a s@mpl3 string!!"'
    * name: 'String: multi line'
      fn: -> oli.parse 'string: "this is a 
      s@mpl3 string!!"'
    * name: 'Number: integer'
      fn: -> oli.parse 'number: 1234891238'
    * name: 'Number: float'
      fn: -> oli.parse 'number: 123.923919'
    * name: 'Number: float positive'
      fn: -> oli.parse 'number: +123.923919'
    * name: 'Boolean'
      fn: -> oli.parse 'boolean: yes'
  ]