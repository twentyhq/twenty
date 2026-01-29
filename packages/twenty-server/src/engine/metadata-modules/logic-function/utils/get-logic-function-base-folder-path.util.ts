import { dirname } from 'path';

// Given a handler path like 'workflow/{id}/dist/index.mjs' or 'workflow/{id}/src/index.ts',
// returns the base folder path 'workflow/{id}'
export const getLogicFunctionBaseFolderPath = (handlerPath: string): string => {
  return dirname(dirname(handlerPath));
};

// Given a handler path like 'workflow/{id}/dist/index.mjs' and a base folder 'workflow/{id}',
// returns the relative path 'dist/index.mjs'
export const getRelativePathFromBase = (
  handlerPath: string,
  baseFolderPath: string,
): string => {
  return handlerPath.replace(`${baseFolderPath}/`, '');
};
