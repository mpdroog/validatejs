/**
 * Basic validators.
 */
({
  define: typeof define === "function"
    ? define
    : function (A, F) {
    module.exports = F.apply(null, A.map(require))
  }
}).

define(["./core", "xregexp"], function (Validate, XReg) {
  "use strict";
  /**
   * E-mail validator.
   * @see http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
   */
  Validate.addValidator("email", function (value) {
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
  });

  /**
   * Dutch zipcode.
   */
  Validate.addValidator("zipdutch", function (value) {
    return /^[0-9]{4}[a-zA-Z]{2}$/.test(value);
  });
  /**
   * Unsigned integer. 0+
   */
  Validate.addValidator("uint", function (value) {
    return /^[0-9]{1,}$/.test(value);
  });
  /**
   * Signed integer. -N to Y
   */
  Validate.addValidator("int", function (value) {
    return /^\-?[0-9]{1,}$/.test(value);
  });
  /**
   * Unsigned decimal. 0.00+
   */
  Validate.addValidator("udecimal", function (value) {
    return /^[0-9]{1,}\.?[0-9]*$/.test(value);
  });
  /**
   * Signed decimal. -N.nn to Y.yy
   */
  Validate.addValidator("decimal", function (value) {
    return /^\-?[0-9]{1,}\.?[0-9]*$/.test(value);
  });

  Validate.addValidator("wordascii", function (value) {
    return /^[a-zA-Z]+$/.test(value);
  });
  Validate.addValidator("worduni", function (value) {
    return XReg.XRegExp("^[\\p{M}\\p{L}]+$").test(value);
  });
  Validate.addValidator("wordsuni", function (value) {
    return XReg.XRegExp("^[\\p{M}\\p{L} ]+$").test(value);
  });
  Validate.addValidator("username", function (value) {
    return /^[a-zA-Z0-9\-_]+$/.test(value);
  });
  Validate.addValidator("ascii", function (value) {
    return /^[a-zA-Z0-9 \\\.\-+_~`!@#\$%^&\*\(\)=|/<>]+$/.test(value);
  });

  Validate.addValidator("json", function (value) {
    try {
      JSON.parseJSON(value);
      return true;
    } catch (e) {
      return false;
    }
  });
  Validate.addValidator("percent", function (value) {
    return /^[0-9]{1,2}|100$/.test(value);
  });
  Validate.addValidator("duration", function (value) {
    return /^[1-9]+ (years?|months?|days?|hours?)$/.test(value);
  });

  Validate.addValidator("externalid", function (value) {
    return /^[0-9]+$/.test(value);
  });
  Validate.addValidator("money", function (value) {
    return /^[0-9]{1,}\.?[0-9]*$/.test(value);
  });
  Validate.addValidator("len", function (value, rules) {
    var ok = 1;
    if (typeof value !== 'string') {
      return false;
    }

    if (rules.hasOwnProperty('max')) {
      ok &= value.length <= rules.max;
    }
    if (rules.hasOwnProperty('min')) {
      ok &= value.length >= rules.min;
    }
    return ok === 1;
  });
  Validate.addValidator("enum", function (value, rules) {
    for (var key in rules) {
      if (rules.hasOwnProperty(key) && value === rules[key]) {
        return true;
      }
    }
    return false;
  });
  Validate.addValidator("country", function (value) {
    return typeof value === 'string' && value.length === 2 && /^[a-zA-Z]{2}$/.test(value);
  });
  // http://stackoverflow.com/questions/9208814/validate-ipv4-ipv6-and-hostname
  Validate.addValidator("ip", function (value) {
    return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^(?:(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){6})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:::(?:(?:(?:[0-9a-fA-F]{1,4})):){5})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:(?:[0-9a-fA-F]{1,4})):){4})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,1}(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:(?:[0-9a-fA-F]{1,4})):){3})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,2}(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:(?:[0-9a-fA-F]{1,4})):){2})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,3}(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:[0-9a-fA-F]{1,4})):)(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,4}(?:(?:[0-9a-fA-F]{1,4})))?::)(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,5}(?:(?:[0-9a-fA-F]{1,4})))?::)(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,6}(?:(?:[0-9a-fA-F]{1,4})))?::))))$/.test(value);
  });
});
