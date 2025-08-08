import { StorybookConfig } from '@storybook/react-vite';
import { createRequire } from "node:module";
import * as path from 'path';
import { dirname, join } from 'path';
import checker from 'vite-plugin-checker';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-coverage"),
    getAbsolutePath("@vueless/storybook-dark-mode"),
    getAbsolutePath("storybook-addon-pseudo-states"),
    getAbsolutePath("@storybook/addon-docs")
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
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
