import { type StorybookConfig } from '@storybook/react-vite';
import * as path from 'path';
import checker from 'vite-plugin-checker';

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],

  addons: [
    '@storybook/addon-links',
    // Coverage addon disabled - incompatible with wyw-in-js and --test builds
    // '@storybook/addon-coverage',
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
