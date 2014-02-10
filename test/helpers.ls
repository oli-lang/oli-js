{
  _
  oli
  suppose
  expect
  inspect
} = require './lib/helper'

describe 'Helpers', ->

  describe 'isType', (e) ->

    it 'should test an object properly', ->
      expect _.is-object null .to.be.false
      expect _.is-object [] .to.be.false
      expect _.is-object {} .to.be.true
      expect _.is-object '!' .to.be.false

    it 'should test an string properly', ->
      expect _.is-string null .to.be.false
      expect _.is-string [] .to.be.false
      expect _.is-string {} .to.be.false
      expect _.is-string '!' .to.be.true

    it 'should test an array properly', ->
      expect _.is-array null .to.be.false
      expect _.is-array [] .to.be.true
      expect _.is-array {} .to.be.false
      expect _.is-array '!' .to.be.false

    it 'should test an number properly', ->
      expect _.is-number null .to.be.false
      expect _.is-number [] .to.be.false
      expect _.is-number 1.2 .to.be.true
      expect _.is-number '!' .to.be.false

  describe 'clone', (e) ->

    obj = prop: obj: nested: yes, final: yes, arr: [ 1, clone: yes ]

    it 'should not equal the first level object', ->
      expect _.clone obj .to.not.be.equal obj

    it 'should not equal the third level object', ->
      expect _.clone(obj).prop.obj .to.not.be.equal obj.prop.obj

    it 'should clone arrays properly', ->
      expect _.clone(obj).prop.obj.arr[1] .to.not.be.equal obj.prop.obj.arr[1]

  describe 'extend', (e) ->

    target = prop: obj: nested: yes, final: yes
    origin = prop: obj: nested: no, another: obj: yes

    it 'should have the same object reference', ->
      expect _.extend target, origin .to.be.equal target

    it 'should override the nested property', ->
      expect _.extend(target, origin).prop.obj.nested .to.be.false

    it 'should add new nested object', ->
      expect _.extend(target, origin).prop.obj.another.obj .to.be.true

  describe 'merge', (e) ->

    target = prop:
      obj: nested: yes
      final: yes
      array: [ 1, 2 ]
    origin = prop:
      obj: nested: no
      another: final: 'oli'
      array: [ 3 ]

    it 'should override a nested property to false', ->
      merged = _.merge target, origin
      expect merged.prop.obj.nested .to.be.false

    it 'should add a new nested object', ->
      merged = _.merge target, origin
      expect merged.prop.another.final .to.be.equal 'oli'

    it 'should override the array object', ->
      merged = _.merge target, origin
      expect merged.prop.array .to.deep.equal [ 1, 2, 3 ]
