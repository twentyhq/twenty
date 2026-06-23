import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromRolePermissionFlagEntityToFlatRolePermissionFlag = (
  args: FromEntityToFlatEntityArgs<'rolePermissionFlag'>,
): FlatRolePermissionFlag => {
  const { entity: rolePermissionFlagEntity } = args;

  const rolePermissionFlagEntityWithoutRelations = fromEntityToScalarEntity({
    metadataName: 'rolePermissionFlag',
    entity: rolePermissionFlagEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'rolePermissionFlag',
      ...args,
    });

  return {
    ...rolePermissionFlagEntityWithoutRelations,
    ...relationUniversalIdentifiers,
  };
};
