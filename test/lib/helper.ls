require! {
  fs
  path
  util
  chai
  grunt
  sinon
  suppose
  traverse
  child_process.spawn
  '../../lib/oli'
  '../../lib/helpers'
  '../../package.json'.version
}

node-bin = process.execPath
oli-bin = path.join __dirname, '/../../', 'bin/oli'
cwd = process.cwd!

module.exports =

  oli: oli
  ast: oli.ast
  parse: oli.parse
  tokens: oli.tokens
  _: helpers
  generate-parser: oli.generate-parser
  oli-bin: oli-bin

  cwd: cwd
  node-bin: node-bin
  version: version
  sinon: sinon
  traverse: traverse
  expect: chai.expect
  should: chai.should
  assert: chai.assert
  chdir: process.chdir
  env: process.env
  join: path.join

  node: (ast, path) ->
    parent = []
    path = path.split '.' if typeof path is 'string'
    if ast.body and ast.body.length
      parent = <[ body ]>
      parent = parent ++ <[ 0 ]> if ast.body.length is 1

    traverse ast .get parent ++ path

  inspect: ->
    util.inspect(it, { depth: null, loc: true }) |> console.log

  createWriteStream: ->
    fs.createWriteStream ...

  exists: ->
    fs.exists-sync it

  read: fs.read-file-sync

  exec: (type, args, callback) ->
    command = spawn node-bin, [ oli-bin ] ++ args
    if type is 'close'
      command.on type, callback
    else
      data = ''
      command.stdout.on type, -> data += it.to-string!
      command.on 'close', (code) -> data |> callback _, code

  suppose: (args) ->
    suppose node-bin, [ oli-bin ] ++ args
