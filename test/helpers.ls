{ 
  h
  oli
  suppose
  expect
  inspect
} = require './lib/helper'

describe 'Helpers', ->

  describe 'isType', (_) ->

    it 'should test an object properly', ->
      expect h.is-object null .to.be.false
      expect h.is-object [] .to.be.false
      expect h.is-object {} .to.be.true
      expect h.is-object '!' .to.be.false

    it 'should test an string properly', ->
      expect h.is-string null .to.be.false
      expect h.is-string [] .to.be.false
      expect h.is-string {} .to.be.false
      expect h.is-string '!' .to.be.true

    it 'should test an array properly', ->
      expect h.is-array null .to.be.false
      expect h.is-array [] .to.be.true
      expect h.is-array {} .to.be.false
      expect h.is-array '!' .to.be.false

    it 'should test an number properly', ->
      expect h.is-number null .to.be.false
      expect h.is-number [] .to.be.false
      expect h.is-number 1.2 .to.be.true
      expect h.is-number '!' .to.be.false

  describe 'clone', (_) ->

    obj = prop: obj: nested: yes, final: yes, arr: [ 1, clone: yes ]

    it 'should not equal the first level object', ->
      expect h.clone obj .to.not.be.equal obj

    it 'should not equal the third level object', ->
      expect h.clone(obj).prop.obj .to.not.be.equal obj.prop.obj

    it 'should clone arrays properly', ->
      expect h.clone(obj).prop.obj.arr[1] .to.not.be.equal obj.prop.obj.arr[1]

  describe 'merge', (_) ->

    target = prop: 
      obj: nested: yes
      final: yes
    origin = prop: 
      obj: nested: no
      another: final: 'oli'

    it 'should override a nested property to false', ->
      merged = h.merge target, origin
      expect merged.prop.obj.nested .to.be.false

    # pending support
    xit 'should add a new nested object', ->
      merged = h.merge target, origin
      expect merged.prop.another.final .to.be.equal 'oli'

    xit 'end', ->
      process.exit!
