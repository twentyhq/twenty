import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import checker from 'vite-plugin-checker';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const isVitest = Boolean(process.env.VITEST);

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],

  addons: [
    '@storybook-community/storybook-addon-cookie',
    '@storybook/addon-links',
    '@storybook/addon-coverage',
    'storybook-addon-pseudo-states',
    '@storybook/addon-vitest',
  ],

  framework: '@storybook/react-vite',

  viteFinal: async (viteConfig) => {
    const plugins = [...(viteConfig.plugins ?? [])];

    if (!isVitest) {
      plugins.push(
        checker({
          typescript: {
            tsconfigPath: path.resolve(dirname, '../tsconfig.json'),
          },
        }),
      );
    }

    return {
      ...viteConfig,
      plugins,
    };
  },
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
