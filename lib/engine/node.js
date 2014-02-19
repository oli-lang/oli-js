'use strict'

var fs = require('fs')

exports = module.exports = function oliRequireHandler(oli) {
  require.extensions['.oli'] = function (module, filename) {
    exports = module.exports = oli.parse(fs.readFileSync(filename, 'utf8'))
  }
}
