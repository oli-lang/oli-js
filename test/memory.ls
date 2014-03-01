{ expect } = require './lib/helper'
Memory = require '../lib/memory'

describe 'Memory', ->
  memory = new Memory

  describe 'interface', (_) ->

    it 'should expose the memory pool object', ->
      expect memory .to.have.ownProperty 'pool' .that.is.an 'object'

    it 'should expose the "flush" method', ->
      expect memory .to.have.property 'flush' .that.is.a 'function'

    it 'should expose the "free" method', ->
      expect memory .to.have.property 'free' .that.is.a 'function'

    it 'should expose the "allocate" method', ->
      expect memory .to.have.property 'allocate' .that.is.a 'function'

    it 'should expose the "size" method', ->
      expect memory .to.have.property 'size' .that.is.a 'function'

    it 'should expose the "fetch" method', ->
      expect memory .to.have.property 'fetch' .that.is.a 'function'

    it 'should expose the "isAllocated" method', ->
      expect memory .to.have.property 'isAllocated' .that.is.a 'function'

  describe 'allocate and fetch', (_) ->

    before -> memory.flush!

    it 'should allocate a string', ->
      memory.allocate 'key', data = 'oli rules!'
      expect memory.fetch 'key' .to.be.equal data

    it 'should allocate an array', ->
      memory.allocate 'key', data = <[cool i like it]>
      expect memory.fetch 'key' .to.be.equal data

    it 'should allocate an object', ->
      memory.allocate 'key', data = this: is: oli: 'language'
      expect memory.fetch 'key' .to.be.equal data

    describe 'fetching nested address', (_) ->

      before-each -> memory.flush!

      it 'should fetch by dot separated key address', ->
        memory.allocate 'this.is.oli', data = this: is: oli: 'language'
        expect memory.fetch 'this.is.oli' .to.be.equal data

      it 'should fetch "oli.language" nested address value', ->
        memory.allocate 'oli', language: yes
        expect memory.fetch 'oli.language' .to.be.true

      it 'should fetch "oli.language.rules" deep nested address value', ->
        memory.allocate 'oli', language: rules: yes
        expect memory.fetch 'oli.language.rules' .to.be.true

      it 'should fetch "oli.language.rules" nested address value', ->
        memory.allocate 'oli', language: looks: really: 'good'
        expect memory.fetch 'oli.language.looks.really' .to.be.equal 'good'

      it 'should fetch a first-level value instead of a nested value', ->
        memory.allocate 'oli.language.rules', yes
        memory.allocate 'oli', language: rules: no
        expect memory.fetch 'oli.language.rules' .to.be.true

  describe 'E2E', ->

    before -> memory.flush!

    describe 'basic', (_) ->
      data = 'oli'

      it 'should allocate data', ->
        expect memory.allocate 'hello', data .to.be.instanceof Memory

      it 'should have a memory pool with one registered node', ->
        expect memory.size! .to.be.equal 1

      it 'should fetch data by its address', ->
        expect memory.fetch 'hello' .to.be.equal data

      it 'should check if an address is allocated', ->
        expect memory.isAllocated 'hello' .to.be.true

      it 'should free node pool address', ->
        memory.free 'hello'
        expect memory.fetch 'hello' .to.be.undefined

      it 'should have an empty pool size', ->
        expect memory.size! .to.be.equal 0
