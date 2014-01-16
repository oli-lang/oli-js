# oli.js

> [Oli][1] language parser for node and the browser

> **work in progress**

## Installation

For node.js
```
$ npm install oli
```

For the browser
```
$ bower install oli
```

## API

#### Example

```js
var oli = require('oli')
var json = oli.parse('message: hello, oli!')
console.log(json)
```

### Oli module

#### parse(code)

#### ast(code [, options])

#### tokens(code [, options])

#### stringify(object)

#### serialize(object)

## To Do

- Serialization support

[1]: https://github.com/h2non/oli
