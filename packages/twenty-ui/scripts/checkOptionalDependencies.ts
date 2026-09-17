import { isString } from '@sniptt/guards';
import { build, type Plugin } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import packageJson from '../package.json';

const PACKAGE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const CODE_EDITOR_ENTRY_POINT = './components/code-editor';
const EDITOR_DEPENDENCY_PATTERN =
  /^(?:monaco-editor|@monaco-editor\/react)(?:\/|$)/;

const rejectEditorDependenciesPlugin: Plugin = {
  name: 'reject-editor-dependencies',
  setup: (build) => {
    build.onResolve({ filter: EDITOR_DEPENDENCY_PATTERN }, ({ path }) => ({
      errors: [{ text: `Unexpected editor dependency: ${path}` }],
    }));
  },
};

for (const [subpath, entryPoint] of Object.entries(packageJson.exports)) {
  if (isString(entryPoint) || subpath === CODE_EDITOR_ENTRY_POINT) {
    continue;
  }

  for (const entryPath of [entryPoint.import, entryPoint.require]) {
    await build({
      entryPoints: [path.resolve(PACKAGE_PATH, entryPath)],
      bundle: true,
      packages: 'external',
      write: false,
      logLevel: 'error',
      loader: { '.css': 'empty' },
      plugins: [rejectEditorDependenciesPlugin],
    });
  }
}

process.stdout.write(
  'Package entry points build without editor dependencies.\n',
);
