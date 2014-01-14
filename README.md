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
var parsed = oli.parse('value: test').json()
console.log(parsed)
```

### Oli module

#### parse([string|buffer])

#### parseAsync([string|buffer], [function])

### Parse API

#### json()

#### yaml()



[1]: https://github.com/h2non/oli
