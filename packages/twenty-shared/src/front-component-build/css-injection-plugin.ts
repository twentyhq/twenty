import * as esbuild from 'esbuild';

import { isDefined } from '@/utils/validation/isDefined';

const buildStyleInjectionModule = (cssText: string): string =>
  `if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);
  styleElement.textContent = ${JSON.stringify(cssText)};
}`;

type CssInjectionPluginOptions = {
  getBuildPlugins?: () => esbuild.Plugin[];
};

export const createCssInjectionPlugin = (
  options?: CssInjectionPluginOptions,
): esbuild.Plugin => ({
  name: 'css-injection',
  setup: (build) => {
    const plugins = options?.getBuildPlugins?.() ?? [];

    build.onLoad({ filter: /\.css$/, namespace: 'file' }, async ({ path }) => {
      const result = await esbuild.build({
        entryPoints: [path],
        bundle: true,
        write: false,
        outfile: 'injected.css',
        logLevel: 'silent',
        plugins,
        loader: Object.fromEntries(
          [
            '.png',
            '.jpg',
            '.jpeg',
            '.gif',
            '.svg',
            '.webp',
            '.avif',
            '.ico',
            '.woff',
            '.woff2',
            '.ttf',
            '.eot',
            '.otf',
          ].map((extension) => [extension, 'dataurl']),
        ),
      });
      const [outputFile] = result.outputFiles;

      if (!isDefined(outputFile)) {
        throw new Error(`CSS build produced no output for ${path}`);
      }

      const cssText = outputFile.text;

      return {
        contents: buildStyleInjectionModule(cssText),
        loader: 'js',
      };
    });
  },
});

export const cssInjectionPlugin = createCssInjectionPlugin();
