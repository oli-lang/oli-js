# oli.js [![Build Status](https://secure.travis-ci.org/oli-lang/oli-js.png?branch=master)][2] [![Dependency Status](https://gemnasium.com/oli-lang/oli-js.png)][3] [![NPM version](https://badge.fury.io/js/oli-js.png)][4]

> Oli minimal language parser and compiler for node and the browser

> **SPOILER! WORK IN PROGRESS**

<table>
<tr>
<td><b>Language version</b></td><td>0.1</td>
</tr>
<tr>
<td><b>Stage</b></td><td>alpha</td>
</tr>
</table>

## About

Multi-purpose high level [Oli language][1] parser and compiler for node.js and the browser,
which implements the latest [language specification][oli-docs]

Oli.js provides a general parsing infraestructure to be consumed from other applications
that uses the Oli syntax for specific purposes, like parsing own DSL

It provides a rich featured high and intermediate level [programmatic API](#programmatic-api)
and [command-line interface](#command-line-interface)

**Note**: oli.js is still an initial alpha implementation! A full compiler re-designing process is pending

## Features

- Powerful parser based on parsing grammar expressions
- Smart compiler with good type inference and more
- Detailed parse and compilation errors
- Runs on node.js and the browser
- High and intermediate level featured API
- Easily usable from command-line and REPL
- Heavily tested with high coverage
- No third party dependencies
- Official language specification implementation
- Good performance (run `grunt bench`)
- Good cyclomatic complexity and maintainability (run `grunt plato`)

## Installation

**Node.js**
```
$ npm install oli
```
For CLI usage only, it's recommented you install it as global package
```
$ npm install -g oli
```

**Browser**
```
$ bower install oli
```
Or load the script remotely (just for testing or development)
```html
<script src="//rawgithub.com/oli-lang/oli-js/master/oli.js"></script>
```
Then you can create script tags with `text/oli` MIME type
```html
<script type="text/oli" src="path/to/file.oli"></script>
```
It will automatically fetch and parse the oli sources and make it available from `oli.scripts`.
To disable the automatic parsing, just add `data-ignore` attribute in the script tag

## Environments

- Node.js >= 0.8.0
- Chrome
- Firefox
- Safari 5
- Opera >= 11.6
- IE >= 9

**Note**: pending tests in embebed JavaScript engines

## Milestones

- **Parser**
  - [x] Top-down parsing (based on PEG strategy)
  - [x] AST
  - [x] Configurable parsing options
  - [x] Errors
  - [?] Unicode
  - [_] Indentation based parsing
- **Compiler**
  - [x] AST walker
  - [x] Memory register
  - [x] Intermediate code transpiler
  - [x] Code generator
  - [*] Interpreter
  - [*] Errors
  - [_] Optimiser
  - [_] Event-driven
- **Interfaces**
  - [x] API
  - [x] CLI
  - [x] REPL
- **Serializer**
  - [_] JSON to Oli
  - [_] Concret Sintax Tree to Oli
- **Environments**
  - [x] Node.js
  - [x] Browser
  - [?] Rhino

#### Upcoming features

There are important features in Oli language spec 0.2. You can see the future features discussion [here](https://github.com/oli-lang/oli/issues?labels=discussion&milestone=1&page=1&state=open)

A summary about most important features that will be implemented

- Interpolated code expressions ([oli/#3](https://github.com/oli-lang/oli/issues/3))
- Generic helper functions (random, string format, date format...)
- Helpers functions extension via API
- Interpolated code with control flow structures
- Block scope variables ([oli/#18](https://github.com/oli-lang/oli/issues/18))
- Indentation-based parsing ([oli/#5](https://github.com/oli-lang/oli/issues/5))
- Date as first-class primitive type ([oli/#2](https://github.com/oli-lang/oli/issues/2))

## Command-line interface

```
Usage: oli [options] path/to/file.oli

Options:

  -h, --help           output usage information
  -V, --version        output the version number
  -p, --parse          parse and return the result as JSON
  -t, --tokens         parse and return a collection of the tokens as JSON
  -o, --output <file>  write output into a file instead of stdout
  -a, --ast            return the parsed AST serialized as JSON
  -i, --in-line        parse in-line argument as string
  -d, --indent <size>  JSON output indent size. Default to 2
  -s, --stdin          Read source from stdin
  -r, --repl           use the interactive read-eval-print loop interface

Examples:

  $ oli file.oli > file.result.json
  $ oli file.oli -o file.result.json
  $ oli --ast file.oli
  $ oli --tokens file.oli
  $ oli --in-line "hello: oli!" > result.json
  $ oli -s < file.oli

```

### REPL

Run `$ oli` without arguments to play with the REPL interface
```
$ oli
Oli experimental REPL interface
Type "examples" to see code examples
oli> - oli, rules, yes
```

## Programmatic API

### Examples

Require the module
```
var oli = require('oli')
```

Parse source
```js
var code = 'message: - hello, oli!'
try {
  var result = oli.parse(code)
} catch (e) {
  console.error('Error while parsing:', e.message)
  console.error(e.errorLines)
}
console.log(result) // => { message: [ "hello", "oli!" ] } }
```

Binding a context to the compiler
```
var code = 'directory: *env.HOME'
var result = oli.parse(code, {
  locals: {
    env: process.env
  }
})
```

#### parse(code, options)
Alias: `transpile`
Return: `mixed`

#### ast(code, options)
Alias: `parseAST`
Return: `object`

This is the most low-level API method.
It returns an object that represent the parsed abstract-syntax tree

> **Note**: AST node types or tree data structures can change between minor versions, as the parser is still beta.
> Please be aware with that in order to prevent possible inconsistencies if your implementation is coupled to the parsed AST

#### parseMeta(code, options)
Alias: `meta`
Return: `mixed`

#### compile(ast)
Alias: `run`

Process the given AST and return the compilation result.

This method will **throw an expection** if a given AST node type is not supported

#### tokens(code, options)
Alias: `parseTokens`

Returns a one-level collection of the existent tokens

#### load(path, callback)
Context: `browser`

Performs an asynchronous XHR request and pass to the callback the response body as plain text.
It will throw an `Error` exception if cannot perform the request
```js
oli.load('path/to/file.oli', function (text) {
  console.log(oli.parse(text))
})
```

### Options

#### meta
Type: `boolean`
Default: `false`

Return an intermediate level object with metadata properties.
This is useful when you need to process an intermediate object that includes tokens, operators, expressions and more, instead of process a cutted resultant object

#### loc
Type: `boolean`
Default: `false`

#### locals
Type: `object`
Default: `null`

Set of local variables context to be passed to the compilation sandbox

### Errors

oli.js provides detailed errors. Usually it will be throwed as exception

#### Types

- SintaxError
- CompileError
- TypeError
- ReferenceError

#### Members

Each error object instance will have the following members

- message
- fullMessage
- line
- column
- offset
- expect (SyntaxError only)
- found (SyntaxError only)

## Contributing

Wanna help? Cool! It will be really apreciated :)

You must add new test cases for any new feature or refactor you do,
always following the same design/code patterns that already exist

Tests specs are completely written in LiveScript language.
Take a look to the language [documentation][3] if you are new with it.
You should follow the LiveScript language conventions defined in the [coding style guide][4]

### Development

Only [node.js](http://nodejs.org) and [Grunt](http://gruntjs.com) are required for development

Clone/fork this repository
```
$ git clone https://github.com/oli-lang/oli-js.git && cd oli-js
```

Install package dependencies
```
$ npm install
```

Run tests
```
$ npm test
```

Run benchmarks
```
grunt bench
```

Coding zen mode
```
$ grunt dev [--force]
```

## License

Copyright (c) Tomas Aparicio

Released under the MIT license


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/h2non/oli.js/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

[1]: http://oli-lang.org
[2]: http://travis-ci.org/oli-lang/oli-js
[3]: https://gemnasium.com/oli-lang/oli-js
[4]: http://badge.fury.io/js/oli

[oli-docs]: http://docs.oli-lang.org
[issues-enhancement]: https://github.com/oli-lang/oli-js/issues?labels=enhancement&milestone=1&page=1&state=open
