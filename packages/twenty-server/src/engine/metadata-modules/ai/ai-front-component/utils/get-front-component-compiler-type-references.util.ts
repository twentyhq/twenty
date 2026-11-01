import { dirname } from 'path';
import { collectFrontComponentTypeReferences } from 'twenty-shared/front-component-build';

let typeReferences: Record<string, string> | undefined;

export const getFrontComponentCompilerTypeReferences = () => {
  typeReferences ??= collectFrontComponentTypeReferences({
    directory: dirname(require.resolve('twenty-server/package.json')),
    dependencies: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
    ],
    includeLibraries: true,
  });
  return typeReferences;
};
