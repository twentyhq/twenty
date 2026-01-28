import { type SourceFile } from 'ts-morph';

export const addExportedType = (
  sourceFile: SourceFile,
  name: string,
  type: string,
): void => {
  sourceFile.addTypeAlias({
    isExported: true,
    name,
    type,
  });
};
