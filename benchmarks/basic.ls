require! '../lib/oli'

module.exports = 
  name: 'Basic'
  tests: 
    Strings: ->
      oli.parse '''
      string: "this is a s@mpl3 string!!"
      '''
    Numbers: ->
      oli.parse '''
      number: 123.9238923929939
      '''
      