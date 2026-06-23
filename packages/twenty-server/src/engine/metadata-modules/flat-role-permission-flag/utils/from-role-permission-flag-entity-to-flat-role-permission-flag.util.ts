import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromRolePermissionFlagEntityToFlatRolePermissionFlag = (
  args: FromEntityToFlatEntityArgs<'rolePermissionFlag'>,
): FlatRolePermissionFlag => {
  const { entity: rolePermissionFlagEntity } = args;

  const rolePermissionFlagEntityWithoutRelations = removePropertiesFromRecord(
    rolePermissionFlagEntity,
    getMetadataEntityRelationProperties('rolePermissionFlag'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'rolePermissionFlag',
      ...args,
    });

  return {
    ...rolePermissionFlagEntityWithoutRelations,
    createdAt: rolePermissionFlagEntity.createdAt.toISOString(),
    updatedAt: rolePermissionFlagEntity.updatedAt.toISOString(),
    universalIdentifier:
      rolePermissionFlagEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
