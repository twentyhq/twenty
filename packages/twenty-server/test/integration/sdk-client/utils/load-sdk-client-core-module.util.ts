import { runInNewContext } from 'node:vm';

import { transform } from 'esbuild';

export const loadSdkClientCoreModule = async (
  moduleSource: string,
): Promise<Record<string, unknown>> => {
  const { code } = await transform(moduleSource, {
    format: 'cjs',
    loader: 'js',
    platform: 'node',
  });

  const loadedModule: { exports: Record<string, unknown> } = { exports: {} };

  runInNewContext(code, {
    module: loadedModule,
    exports: loadedModule.exports,
    process: { env: {} },
  });

  return loadedModule.exports;
};
