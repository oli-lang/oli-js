module.exports = function (oli) {
  
  // listen for window load, both in browsers and in IE.
  if (window.addEventListener != null) {
    addEventListener('DOMContentLoaded', runScripts, false)
  } else if (attachEvent != null) {
    attachEvent('onload', runScripts)
  }

  return { load: load };

  function load(url, callback) {
    xhr = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest;
    xhr.open('GET', url, true);

    if ('overrideMimeType' in xhr) {
      xhr.overrideMimeType('text/plain');
    }

    xhr.onreadystatechange = function() {
      var _ref;
      if (xhr.readyState !== xhr.DONE) {
        return;
      }
      if ((_ref = xhr.status) === 0 || _ref === 200) {
        oli.run(xhr.responseText);
      } else {
        throw new Error("Could not load " + url);
      }
      if (callback) {
        return callback();
      }
    };

    xhr.send(null);
  }

  // Activate Oli in the browser by having it compile and evaluate
  // all script tags with a content-type of `text/oli`
  function runScripts() {
    var sources, index = 0;
    var scripts = document.getElementsByTagName('script');

    sources = (function() {
      var s, i, l, results;
      results = [];
      for (i = 0, l = scripts.length; i < l; i += 1) {
        s = scripts[i];
        if (s.type === 'text/oli' || s.type === 'application/oli') {
          results.push(s);
        }
      }
      return _results;
    })();

    (function execute() {
      var script;
      if (!(script = sources[index += 1])) {
        return;
      }
      if (script.src) {
        return oli.load(script.src, execute);
      } else {
        oli.parse(script.innerHTML);
        return execute();
      }
    })()

    return null
  }
};