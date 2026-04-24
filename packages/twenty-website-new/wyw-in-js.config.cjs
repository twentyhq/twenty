module.exports = {
  babelOptions: {
    presets: [
      require.resolve('next/babel'),
      require.resolve('@wyw-in-js/babel-preset'),
    ],
    compact: true,
  },
};
