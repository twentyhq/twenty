import { camelCase } from 'src/utils/camel-case';

export const createRelationForeignKeyFieldMetadataNameV2 = (name: string) => {
  return `${camelCase(name)}Id`;
};
