{
  md
  exec
  read
  exist
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
      exec 'data', ['--parse' '--indent' '0' "#{__dirname}/fixtures/list.oli"], ->
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

  describe '--ast', (_) ->

    it 'should parse and return the AST', (done) ->
      exec 'data', ['-i' '--ast' 'hello'], ->
        expect it .to.match /"type": "Program",/
        done!

  describe '--output', (_) ->
    file = "#{__dirname}/../.tmp"

    before -> md file

    it 'should parse and write file on disk', (done) ->
      exec 'data', ['-i' '--output' "#{file}/hello.oli" 'hello'], ->
        expect read "#{file}/hello.oli" .to.be.equal '"hello"'
        done!

  describe 'errors', (_) ->

    it 'should return exit code 1 if parse fails', (done) ->
      exec 'data', ['-i' 'hello:'], (it, code) ->
        expect code .to.be.equal 1
        done!
