import { camelCase } from 'src/utils/camel-case';

export const convertClassNameToObjectMetadataName = (name: string): string => {
  const classSuffix = 'ObjectMetadata';
  let objectName = camelCase(name);

  if (objectName.endsWith(classSuffix)) {
    objectName = objectName.slice(0, -classSuffix.length);
  }

  return objectName;
};
