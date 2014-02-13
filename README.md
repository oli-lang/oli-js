# oli.js [![Build Status](https://secure.travis-ci.org/oli-lang/oli-js.png?branch=master)][2] [![Dependency Status](https://gemnasium.com/oli-lang/oli-js.png)][3] [![NPM version](https://badge.fury.io/js/oli-js.png)][4]

> Oli minimal language parser and compiler for node and the browser

> **SPOILER! WORK IN PROGRESS**

<table>
<tr>
<td>Language version</td><td>0.1 (unclosed)</td>
</tr>
<tr>
<td>Stage</td><td>beta</td>
</tr>
</table>

## About

Multi-purpose high level [Oli language][1] parser and compiler for node.js and the browser,
which implements the latest [language specification][oli-docs]

Oli.js provides a general parsing infraestructure to be consumed from other applications
that uses the Oli syntax for specific purposes, like parsing own DSL

It provides a rich featured [programmatic API](#programmatic-api) and [command-line interface](#command-line-interface)

## Features

- Powerful parser based on parsing grammar expressions
- Smart compiler based on type checking and more
- Detailed parse and compilation errors
- Runs on node.js and the browser
- High and intermediate level featured API
- Easily usable from command-line and REPL
- Heavily tested
- Good performance (run `grunt bench`)
- No third party dependencies
- Official language specification implementation

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
- Opera
- Safari
- IE >= 9

**Note**: pending tests in embebed JavaScript engines

## Milestones

- **Parser**
  - [x] Top-down parsing (based on PEG strategy)
  - [x] AST
  - [x] Configurable parsing options
  - [x] Errors
  - [?] Unicode
  - Enhancements
    - [_] Indentation based parsing
- **Compiler**
  - [x] AST walker
  - [x] Memory register
  - [x] Tranpiler pre-processors
  - [x] Intermediate code post-processors
  - [x] References
  - [x] Clone and inheritance
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

A summary about most important features applied to oli.js

- Support for interpolated code expressions ([oli/#3](https://github.com/oli-lang/oli/issues/3))
- Support for generic helper functions (random, string format, date format...)
- Helpers functions extension via API
- Support for control flow structures
- Indent-based blocks

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
  -r, --repl           use the interactive read-eval-print loop interface

Examples:

  $ oli file.oli > file.result.json
  $ oli file.oli -o file.result.json
  $ oli --ast file.oli
  $ oli --tokens file.oli
  $ oli --in-line "hello: oli!" > result.json

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

### Example

```js
var oli = require('oli')

try {
  var json = oli.parse('message: - hello, oli!')
} catch (e) {
  console.error('Cannot parse:', e.fullMessage)
}

console.log(json)
// { message: body: [ "hello", "oli!" ] } }
```

#### parse(code [, options])
Alias: `eval`

#### ast(code [, options])
Alias: `parseAST`

This is the most low-level API method.
It returns an object that represent the parsed abstract-syntax tree

**Note**: AST nodes types or inner data structures can change between minor versions, as the parser is still beta.
Please, be aware with that in order to prevent possible inconsistencies if your implementation is coupled to the parsed AST

#### compile(ast)

#### tokens(code [, options])


#### load(path, callback)
Context: `browser`

Performs an asynchronous XHR request and pass to the callback the response body as plain text.
It will throw an `Error` exception if cannot perform the request
```js
oli.load('path/to/file.oli', function (text) {
  console.log(oli.parse(text))
})
```

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
