const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});
module.exports = [{
    extends: compat.extends("../../eslint.config.global.js", "plugin:@next/next/recommended"),
    rules: {
        "no-console": "off",
        "prefer-arrow/prefer-arrow-functions": "off",
    },
}];
