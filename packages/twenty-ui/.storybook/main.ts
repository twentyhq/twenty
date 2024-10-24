import { StorybookConfig } from '@storybook/react-vite';
import * as path from 'path';
import checker from 'vite-plugin-checker';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-coverage',
    'storybook-dark-mode',
    'storybook-addon-cookie',
    'storybook-addon-pseudo-states',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (config) => {
    return {
      ...config,
      plugins: [
        ...(config.plugins ?? []),
        checker({
          typescript: {
            tsconfigPath: path.resolve(__dirname, '../tsconfig.dev.json'),
          },
        }),
      ],
    };
  },
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
