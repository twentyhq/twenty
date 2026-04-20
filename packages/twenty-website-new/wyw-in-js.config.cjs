module.exports = {
  // Prevent Babel from emitting the 500KB "deoptimised the styling" notice for
  // large vendor ESM files such as Three.js while Linaria evaluates imports.
  babelOptions: {
    presets: ['next/babel', '@wyw-in-js'],
    compact: true,
  },
};
