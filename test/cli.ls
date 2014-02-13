{
  exec
  expect
  suppose
  version
} = require './lib/helper'

describe 'CLI', ->

  describe '--version', (_) ->

    it 'should return the version with --version flag', (done) ->
      exec 'data', ['--version'], ->
        expect it .to.be.equal "#{version}\n"
        done!

    it 'should return the version with -V flag', (done) ->
      exec 'data', ['-V'], ->
        expect it .to.be.equal "#{version}\n"
        done!

  describe '--parse', (_) ->

    it 'should parse reading from file', (done) ->
      exec 'data', ['--parse' "#{__dirname}/fixtures/list.oli"], ->
        expect it .to.be.equal '[\n  1,\n  2,\n  3\n]\n'
        done!

    it 'should parse with custom indent', (done) ->
      exec 'data', ['--parse' '--indent=0' "#{__dirname}/fixtures/list.oli"], ->
        expect it .to.be.equal '[1,2,3]\n'
        done!

  describe '--in-line', (_) ->

    it 'should parse in-line string', (done) ->
      exec 'data', ['-i' 'hello'], ->
        expect it .to.match /\"hello"\n/
        done!

    it 'should parse in-line block', (done) ->
      exec 'data', ['-i' 'hello: world'], ->
        expect it .to.match /\"hello": "world"/
        done!
