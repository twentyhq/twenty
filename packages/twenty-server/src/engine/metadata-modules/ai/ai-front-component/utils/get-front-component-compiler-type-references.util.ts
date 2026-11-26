import {
  collectFrontComponentTypeReferences,
  FRONT_COMPONENT_REACT_IMPORTS,
} from 'twenty-shared/front-component-build';

let typeReferences: Record<string, string> | undefined;

export const getFrontComponentCompilerTypeReferences = () => {
  typeReferences ??= collectFrontComponentTypeReferences({
    directory: __dirname,
    dependencies: [
      ...FRONT_COMPONENT_REACT_IMPORTS,
      'twenty-shared/types',
      'twenty-shared/utils',
      'twenty-shared/translations',
      'twenty-shared/application',
    ],
    shouldIncludeLibraries: true,
  });
  return typeReferences;
};
