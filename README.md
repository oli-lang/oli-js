# oli.js [![Build Status](https://secure.travis-ci.org/h2non/oli.js.png?branch=master)][2] [![Dependency Status](https://gemnasium.com/h2non/oli.js.png)] [![NPM version](https://badge.fury.io/js/oli.js.png)][3]

> [Oli][1] language parser and compiler for node and the browser

<table>
<tr>
<td>Implemented version</td><td>0.1.x</td>
</tr>
</table>

## Installation

For node.js
```
$ npm install oli
```

For the browser
```
$ bower install oli
```
Or add the script tag
```html
<script src="//raw.github.com/h2non/oli.js/master/dist/oli.js"></script>
```

## Parser Milestones

- Type Inference
- Un operators
- Nested blocks

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

## To Do

- Serialization support
- Better browser support

[1]: https://github.com/h2non/oli
[2]: http://travis-ci.org/AdesisNetlife/croak
[3]:  http://badge.fury.io/js/oli
