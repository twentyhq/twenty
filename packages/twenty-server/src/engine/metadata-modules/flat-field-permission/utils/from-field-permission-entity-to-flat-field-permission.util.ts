import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromFieldPermissionEntityToFlatFieldPermission = (
  args: FromEntityToFlatEntityArgs<'fieldPermission'>,
): FlatFieldPermission => {
  const { entity: fieldPermissionEntity } = args;

  const fieldPermissionScalarEntity = fromEntityToScalarEntity({
    metadataName: 'fieldPermission',
    entity: fieldPermissionEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'fieldPermission',
      ...args,
    });

  return {
    ...fieldPermissionScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
