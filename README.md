# oli.js [![Build Status](https://secure.travis-ci.org/oli-lang/oli-js.png?branch=master)][2] [![Dependency Status](https://gemnasium.com/oli-lang/oli-js.png)][3] [![NPM version](https://badge.fury.io/js/oli-js.png)][4]

> [Oli][1] language parser and compiler for node and the browser

> Spoiler! work in progress!!

<table>
<tr>
<td>Oli spec version</td><td>0.1</td>
</tr>
</table>

## Installation

**node.js**
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
Then you can create scripts tag using `text/oli` MIME types
```html
<script type="text/oli" src="path/to/file.oli"></script>
```
It will automatically fetch and parse the oli sources, and make it available from `oli.scripts`

## Milestones

- Parser
  - Variables references
  - String interpolation and templaiting
  - Comparison, math and logical operators
- Compiler
  - Templating
  - Math operations
  - Structure types
- Serializer
  - Type inference
  - Nested structures with type expressions determination

## Features

- Powerful type inference and pattern matching
- Heavily tested (see code coverage)
- Good performance (run `grunt bench`)
- Oli official implementation from the language creator

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

#### stringify(object)

#### serialize(object)
Alias to `stringify()` method

## Contributing

Wanna help? Cool! It will be really apreciated :)

You must add new test cases for any new feature or refactor you do,
always following the same design/code patterns that already exist

Tests specs are completely written in LiveScript language.
Take a look to the language [documentation][3] if you are new with it.
You should follow the LiveScript language conventions defined in the [coding style guide][4]

### Development

Only node.js is required for development

1. Clone/fork this repository
```
$ git clone git@github.com:h2non/oli.js.git && cd oli.js
```

2. Install package dependencies
```
$ npm install
```

3. Run tests
```
$ npm test
```

4. Run benchmarks
```
grunt bench
```

5. Coding zen mode
```
$ grunt dev [--force]
```

## To Do/Wish list

- Browser support
- Compiler to JSON
- Serialization support
- Built-in operators
- Online parser (github pages)

Do you miss something? Feel free to open an issue or make a PR!

## License

Copyright (c) Tomas Aparicio

Released under the MIT license


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/h2non/oli.js/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

[1]: https://github.com/oli-lang/oli
[2]: http://travis-ci.org/oli-lang/oli-js
[3]: https://gemnasium.com/oli-lang/oli-js
[4]: http://badge.fury.io/js/oli
