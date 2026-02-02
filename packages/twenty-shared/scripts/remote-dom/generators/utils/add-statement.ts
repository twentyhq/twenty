import { type SourceFile } from 'ts-morph';

export const addStatement = (
  sourceFile: SourceFile,
  statement: string,
): void => {
  sourceFile.addStatements(statement);
};
