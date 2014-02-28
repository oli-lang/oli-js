'use strict'

var _ = require('../helpers')

var mimeTypes = [
  'text/oli',
  'text/oli-template',
  'application/oli'
]

exports = module.exports = function (oli) {

  // listen for window load, both in browsers and in IE.
  if (window.addEventListener != null) {
    addEventListener('DOMContentLoaded', runScripts, false)
  } else if (attachEvent != null) {
    attachEvent('onload', runScripts)
  }

  // make public the load method
  oli.load = load

  function load(url, callback) {
    var xhr = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest
    xhr.open('GET', url, true)

    if ('overrideMimeType' in xhr) {
      xhr.overrideMimeType('text/plain')
    }

    xhr.onreadystatechange = function() {
      var ref
      if (xhr.readyState !== xhr.DONE) {
        return
      }
      if ((ref = xhr.status) === 0 || ref === 200) {
        callback(xhr.responseText)
      } else {
        throw new Error("Could not load " + url)
      }
    }

    xhr.send(null)
  }

  // Activate Oli in the browser by having it compile
  // all script tags with a the proper MIME type
  function runScripts() {
    var sources, index = 0
    var scripts = document.getElementsByTagName('script')

    sources = getSources(scripts)
    execute()

    function getSources(scripts) {
      var sources = []
      _.forEach(scripts, function (script) {
        if (mimeTypes.indexOf(script.type) !== -1) {
          sources.push(script)
        }
      })
      return sources
    }

    function execute(src) {
      var script = sources[index]

      if (!script) {
        return
      }

      if (!src && script.src) {
        load(script.src, execute)
      } else {
        addScript(script, src, index)
        index += 1
        execute()
      }
    }
  }

  function addScript(script, src, index) {
    oli.scripts = oli.scripts || []
    src = script.innerHTML || src

    var source = {
      id: script.src || index,
      filename: getFilename(script.src),
      source: src
    }

    if (!script.hasAttribute('data-ignore')) {
      source.result = oli.parse(src)
    }

    oli.scripts.push(source)

    function getFilename(src) {
      if (src) {
        src = src
          .split('/')
          .slice(-1)[0]
          .match(/\w+\.?\w+/g)[0]
      }
      return src
    }
  }

}
