import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromPermissionFlagEntityToFlatPermissionFlag = (
  args: FromEntityToFlatEntityArgs<'permissionFlag'>,
): FlatPermissionFlag => {
  const { entity: permissionFlagEntity } = args;

  const entityWithoutRelations = removePropertiesFromRecord(
    permissionFlagEntity,
    getMetadataEntityRelationProperties('permissionFlag'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'permissionFlag',
      ...args,
    });

  return {
    ...entityWithoutRelations,
    createdAt: permissionFlagEntity.createdAt.toISOString(),
    updatedAt: permissionFlagEntity.updatedAt.toISOString(),
    universalIdentifier: entityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
    rolePermissionFlagIds: permissionFlagEntity.rolePermissionFlags.map(
      ({ id }) => id,
    ),
    rolePermissionFlagUniversalIdentifiers:
      permissionFlagEntity.rolePermissionFlags.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
  };
};
