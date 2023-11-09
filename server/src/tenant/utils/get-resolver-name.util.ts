import { ResolverBuilderMethodNames } from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { camelCase } from 'src/utils/camel-case';
import { pascalCase } from 'src/utils/pascal-case';

export const getResolverName = (
  objectMetadata: Pick<ObjectMetadataInterface, 'namePlural' | 'nameSingular'>,
  type: ResolverBuilderMethodNames,
) => {
  switch (type) {
    case 'findMany':
      return `${camelCase(objectMetadata.namePlural)}`;
    case 'findOne':
      return `${camelCase(objectMetadata.nameSingular)}`;
    case 'createMany':
      return `create${pascalCase(objectMetadata.namePlural)}`;
    case 'createOne':
      return `create${pascalCase(objectMetadata.nameSingular)}`;
    case 'updateOne':
      return `update${pascalCase(objectMetadata.nameSingular)}`;
    case 'deleteOne':
      return `delete${pascalCase(objectMetadata.nameSingular)}`;
    default:
      throw new Error(`Unknown resolver type: ${type}`);
  }
};
