import { pickScalarPropertiesFromEntity } from 'src/engine/metadata-modules/flat-entity/utils/pick-scalar-properties-from-entity.util';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromFieldPermissionEntityToFlatFieldPermission = (
  args: FromEntityToFlatEntityArgs<'fieldPermission'>,
): FlatFieldPermission => {
  const { entity: fieldPermissionEntity } = args;

  const fieldPermissionEntityWithoutRelations = pickScalarPropertiesFromEntity({
    metadataName: 'fieldPermission',
    entity: fieldPermissionEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'fieldPermission',
      ...args,
    });

  return {
    ...fieldPermissionEntityWithoutRelations,
    createdAt: fieldPermissionEntity.createdAt.toISOString(),
    updatedAt: fieldPermissionEntity.updatedAt.toISOString(),
    universalIdentifier:
      fieldPermissionEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
