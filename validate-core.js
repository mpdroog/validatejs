/**
 * Simple validation.
 */
({
  define: typeof define === "function"
    ? define
    : function (A, F) {
    module.exports = F.apply(null, A.map(require))
  }
});

define([], function() {
  "use strict";
  var _validators = [], undefined;
  var _debug = false;

  var _methods = {
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

    getMissing: function (input, rules) {
      var errors = [];

      _methods.forEach(rules, function (key, meta) {
        if (!input.hasOwnProperty(key) && !meta.hasOwnProperty("opt")) {
          errors.push({
            fieldName: key,
            reason: "missing"
          });
        }
      });

      return errors;
    },

    getInvalid: function (input, rules) {
      var errors = [];

      _methods.forEach(input, function (key) {
        if (!rules.hasOwnProperty(key)) {
          errors.push({
            fieldName: key,
            reason: "no_rule"
          });
        }
      });

      return errors;
    },

    log: function () {
      if (_debug) {
        console.log(arguments);
      }
    },

    init: function (debug) {
      _debug = debug;
    },

    validate: function (input, rules) {
      var missing = _methods.getMissing(input, rules);
      var norule = _methods.getInvalid(input, rules);
      if (missing.length > 0 || norule.length > 0) {
        return missing.concat(norule);
      }
      return _methods.contentValidate(input, rules);
    },

    contentValidate: function (input, rules) {
      var errors = [];
      _methods.forEach(rules, function (ruleName, validators) {
        if (typeof validators === 'object') {
          // Sub-rules
          var subFields = input[ruleName];
          if (subFields.hasOwnProperty('length')) {
            // Array children
            _methods.forEach(subFields, function (_, value) {
              _methods.log(
                "Validating field (%s) children recursive",
                ruleName
              );
              var e = _methods.contentValidate(value, validators);
              if (e.length > 0) {
                errors = errors.concat(e);
              }
            });
          } else {
            // Regular data
            var e = _methods.contentValidate(subFields, validators);
            if (e.length > 0) {
              errors = errors.concat(e);
            }
          }
        } else {
          // Safe to validate
          var validationRules = validators.split(",");
          _methods.forEach(validationRules, function (_, rule) {
            // Regular validator
            if (rule === "opt") {
              // Ignore this special option
              return;
            }
            if (typeof _validators[rule] === "undefined") {
              throw new Error(
                "Validator with name does not exist. Name=" + rule
              );
            }
            var value = input[ruleName];
            if (value === null && validationRules.indexOf("opt") >= 0) {
              _methods.log(
                "Ignoring content of %s", ruleName
              );
            } else if (!_validators[rule](value, {}, input)) {
              _methods.log(
                "Field (%s) INVALID according to rule(%s) for value (%s)",
                ruleName, rule, value
              );
              var item = {};
              item[ruleName] = value;
              errors.push({
                fieldName: ruleName,
                reason: "Validation failed",
                rule: rule,
                value: value
              });
            } else {
              _methods.log(
                "Field (%s) valid according to rule(%s)",
                ruleName, rule
              );
            }
          });
        }
      });
      return errors;
    },

    /**
     * Add validator.
     *
     * @param name
     * @param fn
     */
    addValidator: function (name, fn) {
      if (typeof _validators[name] !== "undefined") {
        throw new Error(
          "Validator name already set? Name=" + name
        );
      }
      _validators[name] = fn;
    }
  };

  // Public API
  return {
    init: _methods.init,
    validate: _methods.validate,
    addValidator: _methods.addValidator
  };
});