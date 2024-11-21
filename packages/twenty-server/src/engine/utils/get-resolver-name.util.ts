import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { camelCase } from 'src/utils/camel-case';
import { pascalCase } from 'src/utils/pascal-case';

export const getResolverName = (
  objectMetadata: Pick<ObjectMetadataInterface, 'namePlural' | 'nameSingular'>,
  type: WorkspaceResolverBuilderMethodNames,
) => {
  switch (type) {
    case 'findMany':
      return `${camelCase(objectMetadata.namePlural)}`;
    case 'findOne':
      return `${camelCase(objectMetadata.nameSingular)}`;
    case 'findDuplicates':
      return `${camelCase(objectMetadata.nameSingular)}Duplicates`;

    case 'createOne':
      return `create${pascalCase(objectMetadata.nameSingular)}`;
    case 'createMany':
      return `create${pascalCase(objectMetadata.namePlural)}`;

    case 'updateOne':
      return `update${pascalCase(objectMetadata.nameSingular)}`;
    case 'updateMany':
      return `update${pascalCase(objectMetadata.namePlural)}`;

    case 'deleteOne':
      return `delete${pascalCase(objectMetadata.nameSingular)}`;
    case 'deleteMany':
      return `delete${pascalCase(objectMetadata.namePlural)}`;

    case 'destroyOne':
      return `destroy${pascalCase(objectMetadata.nameSingular)}`;
    case 'destroyMany':
      return `destroy${pascalCase(objectMetadata.namePlural)}`;

    case 'restoreOne':
      return `restore${pascalCase(objectMetadata.nameSingular)}`;
    case 'restoreMany':
      return `restore${pascalCase(objectMetadata.namePlural)}`;

    case 'search':
      return `search${pascalCase(objectMetadata.namePlural)}`;
    default:
      throw new Error(`Unknown resolver type: ${type}`);
  }
};
