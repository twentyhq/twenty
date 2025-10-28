import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { camelCase } from 'src/utils/camel-case';
import { pascalCase } from 'src/utils/pascal-case';

export const getResolverName = (
  objectMetadata: Pick<ObjectMetadataEntity, 'namePlural' | 'nameSingular'>,
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

    case 'mergeMany':
      return `merge${pascalCase(objectMetadata.namePlural)}`;

    case 'groupBy':
      return `${camelCase(objectMetadata.namePlural)}GroupBy`;

    default:
      throw new Error(`Unknown resolver type: ${type}`);
  }
};
