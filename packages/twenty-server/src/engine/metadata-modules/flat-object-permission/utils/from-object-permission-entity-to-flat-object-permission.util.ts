import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromObjectPermissionEntityToFlatObjectPermission = (
  args: FromEntityToFlatEntityArgs<'objectPermission'>,
): FlatObjectPermission => {
  const { entity: objectPermissionEntity } = args;

  const objectPermissionScalarEntity = fromEntityToScalarEntity({
    metadataName: 'objectPermission',
    entity: objectPermissionEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'objectPermission',
      ...args,
    });

  return {
    ...objectPermissionScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
