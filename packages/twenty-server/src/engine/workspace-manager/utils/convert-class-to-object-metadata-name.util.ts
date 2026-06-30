import { camelCase } from 'src/utils/camel-case';

const classSuffix = 'WorkspaceEntity';

export const convertClassNameToObjectMetadataName = (name: string): string => {
  let objectName = camelCase(name);

  if (objectName.endsWith(classSuffix)) {
    objectName = objectName.slice(0, -classSuffix.length);
  }

  return objectName;
};
