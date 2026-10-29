import { build } from 'esbuild';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import { FRONT_COMPONENT_BUILDER_DIRECTORY } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-builder-directory.constant';

let helpers: Promise<string> | undefined;

export const getFrontComponentBuilderFiles = async () => {
  helpers ??= build({
    absWorkingDir: resolve(__dirname, '../..'),
    entryPoints: [
      require.resolve('../../utils/execute-front-component-builder-request.util'),
    ],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    external: ['esbuild'],
    write: false,
    plugins: [
      {
        name: 'yarn-installer',
        setup(pluginBuild) {
          pluginBuild.onResolve(
            { filter: /install-yarn-dependencies\.cjs$/ },
            () => ({
              path: join(YARN_ENGINE_DIRNAME, 'install-yarn-dependencies.cjs'),
            }),
          );
        },
      },
    ],
  })
    .then((result) => result.outputFiles[0].text)
    .catch((error: unknown) => {
      helpers = undefined;
      throw error;
    });

  return {
    'index.mjs': await readFile(
      join(FRONT_COMPONENT_BUILDER_DIRECTORY, 'index.mjs'),
      'utf8',
    ),
    'helpers.cjs': await helpers,
  };
};
