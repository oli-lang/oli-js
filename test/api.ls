{
  oli
  ast
  node
  expect
  inspect
} = require './lib/helper'

describe 'API', ->

  describe 'members', (_) ->

    it 'should expose the Compile function',  ->
      expect oli.Compiler .to.be.a 'function'

    it 'should expose the Memory function',  ->
      expect oli.Memory .to.be.a 'function'

    it 'should expose the parser object',  ->
      expect oli.parser .to.be.a 'function'

  describe 'ast()', (_) ->

    it 'should expose the methods', ->
      expect oli.ast .to.be.a 'function'
      expect oli.parseAST .to.be.a 'function'

    it 'should have the proper AST object', ->
      expect (ast 'oli rules!').body[0] .to.have.property 'value' .and.be.equal 'oli rules!'

    it 'should have an object with number of code', ->
      expect (ast 'oli rules!', { loc: true }).body[0] .to.have.property 'loc' .and.be.an.object

    describe 'options', (_) ->

      it 'should omit the lines of code AST node', ->
        expect (ast 'oli rules!', { loc: false }).body[0] .to.not.have.property 'loc'

  describe 'parse()', (_) ->

    it 'should expose the methods', ->
      expect oli.parse .to.be.a 'function'
      expect oli.eval .to.be.a 'function'

    it 'should have the proper AST object', ->
      expect (ast 'oli rules!').body[0] .to.have.property 'value' .and.be.equal 'oli rules!'

    it 'should have an object with number of code', ->
      expect (ast 'oli rules!', { loc: true }).body[0] .to.have.property 'loc' .and.be.an.object

    describe 'options', (_) ->

      it 'should omit the lines of code AST node', ->
        expect (ast 'oli rules!', { loc: false }).body[0] .to.not.have.property 'loc'

  describe 'compile()', (_) ->

    it 'should expose the methods', ->
      expect oli.compile .to.be.a 'function'
      expect oli.run .to.be.a 'function'

  describe 'tokens()', (_) ->

    it 'should expose the tokens methods', ->
      expect oli.tokens .to.be.a 'function'
      expect oli.parseTokens .to.be.a 'function'

    it 'should return the property tokens', ->
      tokens = oli.tokens 'hello > world: "oli"'
      expect tokens[0] .to.be.deep.equal { type: 'ValueStatement', value: ':' }
      expect tokens[1] .to.be.deep.equal { type: 'Identifier', value: 'hello' }
      expect tokens[4] .to.be.deep.equal { type: 'StringLiteral', value: 'oli' }

