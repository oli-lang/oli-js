# oli.js [![Build Status](https://secure.travis-ci.org/h2non/oli.js.png?branch=master)][2] [![Dependency Status](https://gemnasium.com/h2non/oli.js.png)][3] [![NPM version](https://badge.fury.io/js/oli.js.png)][4]

> [Oli][1] language parser and compiler for node and the browser

> Spoiler! work in progress!!

<table>
<tr>
<td>Oli supported version</td><td>0.1</td>
</tr>
</table>

## Installation

**For node.js**
```
$ npm install oli
```
For CLI usage only, it's recommented you install it as global package
```
$ npm install -g oli
```

For the browser
```
$ bower install oli
```
Or add the script tag
```html
<script src="//raw.github.com/h2non/oli.js/master/dist/oli.js"></script>
```
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

#### parse(code)

#### ast(code [, options])

#### tokens(code [, options])

#### stringify(object)

#### serialize(object)


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

[1]: https://github.com/h2non/oli
[2]: http://travis-ci.org/h2non/oli.js
[3]: https://gemnasium.com/h2non/oli.js
[4]: http://badge.fury.io/js/oli
