/**
 * Webform validation.
 */
define(["json!rules", "class", "validateCore", "validateRules"], function (Rules, Class, Validate) {
  var undefined;
  var _debug = false;
  var _methods = {
    /**
     * Call init if you want to debug
     * @param debug
     */
    init: function(debug) {
      _debug = debug;
      Validate.init(debug);
    },

    /**
     * Utility method to remove repetitive code.
     * @param data
     * @param fn
     */
    forEach: function (data, fn) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          fn(key, data[key]);
        }
      }
    },

    /**
     * Validate for number.
     *
     * @param obj
     * @returns {boolean}
     */
    isNumeric: function (obj) {
      return (obj - parseFloat(obj) + 1) >= 0;
    },

    /**
     * Collection phase.
     * Read DOM and collect element+value
     *  based on validation required fields
     *
     * @param key
     * @param extraItems
     * @returns {{elements: {}, values: {}}}
     */
    readDOM: function(key, extraItems) {
      if (!Rules.hasOwnProperty(key)) {
        throw Error("Invalid key in validation rules: " + key);
      }
      extraItems = extraItems || {};
      var rules = Rules[key];

      var elements = {};
      var values = {};

      _methods.forEach(rules, function (item) {
        if (extraItems.hasOwnProperty(item)) {
          // Received from func-args
          elements[item] = null;
          values[item] = extraItems[item];
          return;
        }
        var el = document.getElementsByName(item);
        if (el === undefined || el.length === 0) {
          throw Error("No such item in form: " + item);
        }
        if (el.length === 1 && el[0].tagName === "INPUT") {
          elements[item] = el[0];
          values[item] = el[0].value;
        } else {
          console.log(el);
          throw Error("TODO: Unsupported output");
        }
      });

      return {elements: elements, values: values};
    },

    /**
     * Create text for validation error text.
     * TODO: Might be better to abstract away from here?
     * @param text
     * @param type
     */
    createText: function(text, type) {
      if (type === "len") {
        if (text.length === 0) {
          return "Please supply a text";
        }
        return "Given text is either too small or too long";
      } else if (type === "email") {
        return "Please supply a valid e-mail";
      }
      throw Error("Unsupported rule=" + type);
    },

    /**
     * Get the parent with className like "js-group"
     * @param el
     */
    getParent: function(element) {
      var el = element;
      while (true) {
        el = el.parentNode;
        if (el.tagName === "BODY") {
          console.log(element);
          throw Error("Could not find HTMLElement with className contain js-group");
        }
        if (el.className.indexOf("js-group") > -1) {
          // Found
          return el;
        }
      }
    },

    toggleError: function(el, type, result) {
      type = type || "err";

      var p = _methods.getParent(el).getElementsByClassName("js-error");
      _methods.forEach(p, function (k, item) {
        if (!_methods.isNumeric(k)) {
          _methods.log("Ignore key=" + k);
          return;
        }
        if (type === "err") {
          if (item.className.indexOf("help-block") != -1) {
            console.log(item, result);
            item.innerHTML += _methods.createText(result.value, result.rule) + "<br>";
          }
          Class.del(item, "hidden");
        } else {
          if (item.className.indexOf("help-block") != -1) {
            item.innerHTML = "";
          }
          Class.add(item, "hidden");
        }
      });
    },

    /**
     * Feedback phase.
     * Update UI with errors.
     *
     * @param results
     * @param elements
     */
    updateDOM: function(results, elements) {
      // Lazy me here..
      _methods.forEach(elements, function (_, element) {
        if (element === null) {
          // Ignore, value to validate was
          //  supplied through extraItems-var.
          return;
        }
        _methods.toggleError(element, "hide");
      });

      // Now show error where needed
      _methods.forEach(results, function (_, result) {
        var name = result.fieldName;
        if (elements[name] === null) {
          // Ignore, value to validate was
          //  supplied through extraItems-var.
          return;
        }
        if (elements[name] === undefined) {
          throw Error(name + " missing in elements-array from collection-phase?");
        }
        _methods.toggleError(elements[name], "err", result);
      });
    },

    /**
     * Validate user-input.
     *
     * @param string key Rules to apply to rules.json
     * @param {string} extraItems Additional items {key:item}
     * @returns boolean If validation succeeded
     */
    check: function(key, extraItems) {
      var items = _methods.readDOM(key, extraItems);
      _methods.log("Validate with collected data (values, rules)", items["values"], Rules[key]);
      var results = Validate.validate(items["values"], Rules[key]);
      _methods.updateDOM(results, items["elements"]);

      if (results.length > 0) {
        _methods.log("Validation failure results", results);
        return false;
      }
      return true;
    },

    log: function () {
      if (_debug) {
        console.log(arguments);
      }
    }
  };

  return {
    check: _methods.check,
    init: _methods.init
  };
});
