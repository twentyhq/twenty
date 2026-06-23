import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromObjectPermissionEntityToFlatObjectPermission = (
  args: FromEntityToFlatEntityArgs<'objectPermission'>,
): FlatObjectPermission => {
  const { entity: objectPermissionEntity } = args;

  const objectPermissionEntityWithoutRelations = removePropertiesFromRecord(
    objectPermissionEntity,
    getMetadataEntityRelationProperties('objectPermission'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'objectPermission',
      ...args,
    });

  return {
    ...objectPermissionEntityWithoutRelations,
    createdAt: objectPermissionEntity.createdAt.toISOString(),
    updatedAt: objectPermissionEntity.updatedAt.toISOString(),
    universalIdentifier:
      objectPermissionEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
