import { pickScalarPropertiesFromEntity } from 'src/engine/metadata-modules/flat-entity/utils/pick-scalar-properties-from-entity.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromRoleTargetEntityToFlatRoleTarget = (
  args: FromEntityToFlatEntityArgs<'roleTarget'>,
): FlatRoleTarget => {
  const { entity: roleTargetEntity } = args;

  const roleTargetEntityWithoutRelations = pickScalarPropertiesFromEntity({
    metadataName: 'roleTarget',
    entity: roleTargetEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'roleTarget',
      ...args,
    });

  return {
    ...roleTargetEntityWithoutRelations,
    createdAt: roleTargetEntity.createdAt.toISOString(),
    updatedAt: roleTargetEntity.updatedAt.toISOString(),
    universalIdentifier: roleTargetEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
