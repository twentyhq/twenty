import { ResolverMethodNames } from 'src/tenant/schema-builder/interfaces/schema-resolvers.interface';

import { IObjectMetadata } from 'src/tenant/schema-builder/metadata/object.metadata';
import { camelCase } from 'src/utils/camel-case';
import { pascalCase } from 'src/utils/pascal-case';

export const getResolverName = (
  metadata: IObjectMetadata,
  type: ResolverMethodNames,
) => {
  switch (type) {
    case 'findMany':
      return `${camelCase(metadata.namePlural)}`;
    case 'findOne':
      return `${camelCase(metadata.nameSingular)}`;
    case 'createMany':
      return `create${pascalCase(metadata.namePlural)}`;
    case 'createOne':
      return `create${pascalCase(metadata.nameSingular)}`;
    case 'updateOne':
      return `update${pascalCase(metadata.nameSingular)}`;
    case 'deleteOne':
      return `delete${pascalCase(metadata.nameSingular)}`;
    default:
      throw new Error(`Unknown resolver type: ${type}`);
  }
};
