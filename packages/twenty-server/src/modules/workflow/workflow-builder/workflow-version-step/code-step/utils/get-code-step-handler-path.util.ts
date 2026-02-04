import { dirname } from 'path';

export const getLogicFunctionBaseFolderPath = (handlerPath: string): string => {
  return dirname(dirname(handlerPath));
};
