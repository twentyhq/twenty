module.exports = {
  extends: ['../../.eslintrc.cjs', '../../.eslintrc.react.cjs'],
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
                message: 'Please import icons from `@ui/display`',
              },
              {
                group: ['react-hotkeys-web-hook'],
                importNames: ['useHotkeys'],
                message:
                  'Please use the custom wrapper: `useScopedHotkeys` from `@ui/utilities`',
              },
              {
                group: ['lodash'],
                message:
                  "Please use the standalone lodash package (for instance: `import groupBy from 'lodash.groupby'` instead of `import { groupBy } from 'lodash'`)",
              },
              {
                group: ['@lingui/*'],
                message:
                  'Please do not use Lingui in twenty-ui. Internationalization should be handled in twenty-front/twenty-emails/twenty-server packages.',
              },
            ],
          },
        ],
        '@nx/dependency-checks': 'error',
      },
    },
  ],
};
