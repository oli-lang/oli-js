'use strict';

var _ = require('./helpers')

/**
 * High level trivial memory implementation based on the pool allocation strategy
 */

module.exports = Memory

function Memory(initialPool) {
  this.pool = {}

  if (_.isObject(initialPool)) {
    _.extend(this.pool, initialPool)
  }
}

Memory.prototype.allocate = function (address, data) {
  if (address) {
    this.pool[address] = data
  }
  return this
}

Memory.prototype.free = function (address) {
  if (this.pool.hasOwnProperty(address) && this.pool[address] !== undefined) {
    this.pool[address] = undefined
  }
  return this
}

Memory.prototype.fetch = function (address) {
  return this.pool[address]
}

Memory.prototype.size = function () {
  return _.objKeys(this.pool).length
}

Memory.prototype.flush = function () {
  this.pool = {}
  return this
}
