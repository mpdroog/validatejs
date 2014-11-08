/**
 * Simple validation.
 */
({
  /**
   * NodeJS support
   */
  define: typeof define === "function"
    ? define
    : function (A, F) {
    module.exports = F.apply(null, A.map(require))
  }
}).
define([], function() {
  "use strict";
  var _validators = [], undefined;
  var _debug = false;

  if (!String.prototype.trim) {
    /**
     * JS Shim < JavaScript 1.8.1
     * Trim whitespace from each end of a String
     * @returns {String} the original String with whitespace removed from each end
     * @example
     * ' foo bar    '.trim(); //'foo bar'
     */
    String.prototype.trim = function trim() {
      return this.toString().replace(/^([\s]*)|([\s]*)$/g, '');
    };
  }

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

    confParse: function (rules) {
      var output = {};
      var errors = [];

      _methods.forEach(rules.split(","), function (_, rule) {
        _methods.log("confParse: " + rule);
        var args = {};
        rule = rule.trim();
        if (rule.indexOf("(") > 0 && rule.indexOf(")") > 0) {
          // TODO: substring cross browser?
          // TODO: extract to own function?
          var tmp = rule.substring(
            rule.indexOf("(") + 1,
            rule.indexOf(")")
          );
          rule = rule.substr(0, rule.indexOf("("));
          _methods.forEach(tmp.split("|"), function (_, item) {
            var sep = item.indexOf("=");
            if (sep < 0) {
              errors.push({
                fieldName: rule,
                reason: "Failed extracting rule key=value",
                rule: item,
                value: null
              });
              return;
            }
            var key = item.substr(0, sep);
            var value = item.substr(sep + 1);
            if (args.hasOwnProperty(key)) {
              throw "Weird error, duplicate key=" + key;
            }
            args[key] = value;
          });
        }
        if (output.hasOwnProperty(rule)) {
          _methods.log(output[rule], args);
          throw "Weird error, duplicate key=" + rule;
        }
        output[rule] = args;
      });

      return [output, errors];
    },

    contentValidate: function (input, rules) {
      var errors = [];
      _methods.forEach(rules, function (fieldName, validators) {
        if (typeof validators === 'object') {
          // Sub-rules
          var subFields = input[fieldName];
          if (subFields.hasOwnProperty('length')) {
            // Array children
            _methods.forEach(subFields, function (_, value) {
              _methods.log(
                "Validating field (%s) children recursive",
                fieldName
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
          var v = _methods.confParse(validators);
          _methods.forEach(v[1], function(_, e) {
            errors.push(e);
          });
          _methods.forEach(v[0], function (ruleName, rule) {
            // Regular validator
            if (ruleName === "opt" || ruleName === "reqif") {
              // No validator so skip (will be used when invalid input)
              return;
            }
            if (typeof _validators[ruleName] === "undefined") {
              errors.push({
                fieldName: ruleName,
                reason: "No such rule",
                rule: rule,
                value: null
              });
              return;
            }
            var value = input[fieldName];
            if ((value === null || value === "") && v[0].hasOwnProperty("opt")) {
              _methods.log(
                "Ignoring content of %s", ruleName
              );
            } else if (!_validators[ruleName](value, rule, input)) {
              var ignore = false;
              // reqif ensures rule is only required to be valid
              //  if specific field has a value
              if (v[0].hasOwnProperty("reqif")) {
                var reqif = v[0].reqif;
                _methods.forEach(reqif, function(cmpName, cmpVal) {
                  if (typeof input[cmpName] === "undefined") {
                    errors.push({
                      fieldName: fieldName,
                      reason: "reqif cannot find dependant field",
                      rule: ruleName,
                      value: cmpName + "=" + cmpVal
                    });
                    return;
                  }

                  var other = input[cmpName];
                  if (other !== cmpVal) {
                    // Break here, reqif is not the case
                    _methods.log(
                      "Ignoring reqif value not equals of %s", ruleName
                    );
                    ignore = true;
                  }
                });
              }

              if (ignore) {
                return;
              }
              _methods.log(
                "Field (%s) INVALID according to rule(%s) for value (%s)",
                fieldName, ruleName, value
              );
              errors.push({
                fieldName: fieldName,
                reason: "Validation failed",
                rule: ruleName,
                value: value
              });
            } else {
              _methods.log(
                "Field (%s) valid according to rule(%s)",
                fieldName, ruleName
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
    },

    getValidators: function() {
      return _validators;
    }
  };

  // Public API
  return {
    init: _methods.init,
    validate: _methods.validate,
    addValidator: _methods.addValidator,
    getValidators: _methods.getValidators
  };
});
