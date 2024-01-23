import { camelCase } from 'src/utils/camel-case';

export const createRelationForeignKeyFieldMetadataName = (name: string) => {
  return `${camelCase(name)}Id`;
};
