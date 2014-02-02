module.exports = function (oli) {

  // listen for window load, both in browsers and in IE.
  if (window.addEventListener != null) {
    addEventListener('DOMContentLoaded', runScripts, false)
  } else if (attachEvent != null) {
    attachEvent('onload', runScripts)
  }

  return { load: load }

  function load(url, callback) {
    xhr = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest
    xhr.open('GET', url, true)

    if ('overrideMimeType' in xhr) {
      xhr.overrideMimeType('text/plain')
    }

    xhr.onreadystatechange = function() {
      var _ref
      if (xhr.readyState !== xhr.DONE) {
        return
      }
      if ((_ref = xhr.status) === 0 || _ref === 200) {
        callback(xhr.responseText)
      } else {
        throw new Error("Could not load " + url)
      }
    }

    xhr.send(null)
  }

  // Activate Oli in the browser by having it compile and evaluate
  // all script tags with a content-type of `text/oli`
  function runScripts() {
    var sources, index = 0
    var scripts = document.getElementsByTagName('script')

    sources = (function() {
      var s, i, l, results = []
      for (i = 0, l = scripts.length; i < l; i += 1) {
        s = scripts[i]
        if (s.type === 'text/oli' || s.type === 'application/oli' || s.type === 'plain/oli') {
          results.push(s)
        }
      }
      return results
    })();

    (function execute(src) {
      var script;

      debugger;
      if (!(script = sources[index])) {
        return
      }

      if (!src && script.src) {
        oli.load(script.src, execute)
      } else {
        oli.scripts = oli.scripts || []
        console.log(oli.scripts)
        oli.scripts.push({
          id: script.src || index,
          source: oli.parse(script.innerHTML || src)
        })
        index += 1
        execute()
      }
    })()

    return null
  }
}
