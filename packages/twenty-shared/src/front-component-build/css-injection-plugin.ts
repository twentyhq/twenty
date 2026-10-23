import { resolve } from 'node:path';

import type * as esbuild from 'esbuild';

import { CustomError } from '@/utils/errors/CustomError';
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
      const result = await build.esbuild.build({
        absWorkingDir: build.initialOptions.absWorkingDir,
        entryPoints: [path],
        bundle: true,
        write: false,
        outfile: 'injected.css',
        metafile: true,
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
        throw new CustomError(
          `CSS build produced no output for ${path}`,
          'CSS_BUILD_EMPTY_OUTPUT',
        );
      }

      const cssText = outputFile.text;

      return {
        contents: buildStyleInjectionModule(cssText),
        loader: 'js',
        watchFiles: Object.keys(result.metafile.inputs).map((input) =>
          resolve(build.initialOptions.absWorkingDir ?? process.cwd(), input),
        ),
      };
    });
  },
});

export const cssInjectionPlugin = createCssInjectionPlugin();
