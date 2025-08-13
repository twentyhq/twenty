import { type StorybookConfig } from '@storybook/react-vite';
import * as path from 'path';
import { dirname, join } from 'path';
import checker from 'vite-plugin-checker';


const getAbsolutePath = (value: string): any => {
  return dirname(require.resolve(join(value, "package.json")));
};

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-coverage"),
    getAbsolutePath("storybook-addon-cookie"),
    getAbsolutePath("storybook-addon-pseudo-states"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
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

  docs: {
    autodocs: true
  }
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
