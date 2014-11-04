/**
 * Primitive class modifier.
 */
define([], function() {
  "use strict";
  // Private
  var _methods = {
    add: function (element, name) {
      if (element.className.indexOf(name) === -1) {
        element.className += " " + name;
      }
      return _methods;
    },
    del: function(element, name) {
      if (element.className.indexOf(name) > -1) {
        element.className = element.className.replace(name, '');
      }
      return _methods;
    }
  };

  return _methods;
});
