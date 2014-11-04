require.config({
  baseUrl: "/assets/js",
  paths: {
    class: "class",
    xregexp: "lib/xregexp.min",

    json: "requirejs/json",
    text: "requirejs/text",

    rules: 'rules.json',
    validateCore: "validate/core",
    validateRules: "validate/rules",
    validate: "validate/web",
  },
  map: {
    "*": {
      /* alias for validate/rules.js */
      core: "validateCore"
    }
  }
});
