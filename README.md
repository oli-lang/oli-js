# oli.js [![Build Status](https://secure.travis-ci.org/oli-lang/oli-js.png?branch=master)][2] [![Dependency Status](https://gemnasium.com/oli-lang/oli-js.png)][3] [![NPM version](https://badge.fury.io/js/oli-js.png)][4]

> [Oli][1] language parser and compiler for node and the browser

> **Spoiler! work in progress**

<table>
<tr>
<td>Supported language version</td><td>0.1</td>
</tr>
<tr>
<td>Stage</td><td>beta</td>
</tr>
</table>

## About



## Features

- Powerful type inference and pattern matching
- Heavily tested (see code coverage)
- Good performance (run `grunt bench`)
- Oli official implementation from the language creator

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

## Milestones stages

- **Parser**
  - [x] Top-down parsing (based on PEG strategy)
  - [x] AST
  - [x] Parsing options
  - **Enhancements**
    - [_] Indentation based support
- Compiler
  - [x] AST walker
  - [x] Memory
  - [x] Tranpiler pre-processors
  - [x] Intermediate code post-processors
  - [x] References
  - [x] Clone and inheritance
  - [_] Optimizer
  - [_] Custom errors
- Serializer
  - [_] JSON to Oli
  - [_] Concret Sintax Tree to Oli

## API

### Example

```js
var oli = require('oli')
var json = oli.parse('message: hello, oli!')
console.log(json)
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

Only node.js is required for development

Clone/fork this repository
```
$ git clone git@github.com:h2non/oli.js.git && cd oli.js
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

[1]: https://github.com/oli-lang/oli
[2]: http://travis-ci.org/oli-lang/oli-js
[3]: https://gemnasium.com/oli-lang/oli-js
[4]: http://badge.fury.io/js/oli
