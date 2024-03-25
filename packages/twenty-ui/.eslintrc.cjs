const path = require('path');

module.exports = {
  extends: ['../../.eslintrc.js', '../../.eslintrc.react.js'],
  ignorePatterns: ['!**/*'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['packages/twenty-ui/tsconfig.{json,*.json}'],
      },
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@tabler/icons-react'],
                message: 'Please import icons from `src/display`',
              },
              {
                group: ['react-hotkeys-web-hook'],
                importNames: ['useHotkeys'],
                message:
                  'Please use the custom wrapper: `useScopedHotkeys` from `src/utilities`',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['.storybook/main.@(js|cjs|mjs|ts)'],
      rules: {
        'storybook/no-uninstalled-addons': [
          'error',
          { packageJsonLocation: path.resolve('../../package.json') },
        ],
      },
    },
  ],
};
