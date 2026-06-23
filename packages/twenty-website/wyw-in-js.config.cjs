module.exports = {
  babelOptions: {
    presets: [
      require.resolve('@babel/preset-typescript'),
      require.resolve('@babel/preset-react'),
      require.resolve('@wyw-in-js/babel-preset'),
    ],
    plugins: [require.resolve('@babel/plugin-transform-export-namespace-from')],
    compact: true,
  },
};
