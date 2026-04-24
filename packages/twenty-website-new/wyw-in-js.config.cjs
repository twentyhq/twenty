module.exports = {
  // Prevent Babel from emitting the 500KB "deoptimised the styling" notice for
  // large vendor ESM files such as Three.js while Linaria evaluates imports.
  babelOptions: {
    // Pre-resolve presets to absolute paths so they work regardless of how
    // yarn berry hoists `next` and `@wyw-in-js/babel-preset` in the workspace.
    // `babel-merge` calls `@babel/core`'s `resolvePreset` without a dirname,
    // which makes Babel resolve from `@babel/core`'s own location rather than
    // from this config file — breaking when those packages are nested in
    // `packages/twenty-website-new/node_modules` instead of hoisted to the
    // workspace root (e.g. in single-workspace Docker builds).
    presets: [
      require.resolve('next/babel'),
      require.resolve('@wyw-in-js/babel-preset'),
    ],
    compact: true,
  },
};
