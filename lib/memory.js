'use strict'

var _ = require('./helpers')

/**
 * High level basic memory register implementation
 * based on a pool allocation strategy
 */

exports = module.exports = Memory

function Memory(basePool) {
  this.pool = {}
  if (_.isObject(basePool)) {
    this.push(basePool)
  }
}

Memory.prototype.allocate = function (address, data) {
  if (address) {
    this.pool[address] = data
  }
  return this
}

Memory.prototype.push = function (data) {
  _.extend(this.pool, _.clone(data))
}

Memory.prototype.isAllocated = function (address) {
  return this.fetch(address) !== undefined
}

Memory.prototype.free = function (address) {
  if (this.pool.hasOwnProperty(address) && this.pool[address] !== undefined) {
    // set as undefined, delete operator has a performance hit on JS engines
    this.pool[address] = undefined
  }
  return this
}

Memory.prototype.fetch = function (address) {
  var path, node

  if (typeof address === 'string') {
    node = this.pool[address]
    if (node === undefined) {
      path = address.split('.')
      if (path.length > 1) {
        node = findNode(this.pool, path)
      }
    }
  }

  return node
}

Memory.prototype.size = function () {
  var size = 0

  _.forEach(this.pool, function (node) {
    if (node !== undefined) {
      size += 1
    }
  })

  return size
}

Memory.prototype.flush = function () {
  this.pool = {}
  return this
}

function findNode(obj, path) {
  var i, l, node, current

  for (i = 0, l = path.length; i < l; i += 1) {
    current = obj[path[i]]
    if (hasMetaData(current)) {
      current = current['$$body']
    }
    if (current !== undefined && isLatest(i)) {
      node = current
      break;
    }
    if (!_.isObject(current)) {
      break;
    }
    obj = current
  }

  return node

  function isLatest() {
    return i === path.length - 1
  }
}

function hasMetaData(obj) {
  return _.has(obj, '$$body') || _.has(obj, '$$name')
}
