import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import checker from 'vite-plugin-checker';

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-coverage',
    // 'storybook-addon-cookie',
    'storybook-addon-pseudo-states',
  ],

  framework: '@storybook/react-vite',

  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    plugins: [
      ...(viteConfig.plugins ?? []),
      checker({
        typescript: {
          tsconfigPath: path.resolve(__dirname, '../tsconfig.dev.json'),
        },
      }),
    ],
  }),
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
