import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-cache/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromRoleTargetEntityToFlatRoleTarget = (
  args: FromEntityToFlatEntityArgs<'roleTarget'>,
): FlatRoleTarget => {
  const { entity: roleTargetEntity } = args;

  const roleTargetEntityWithoutRelations = removePropertiesFromRecord(
    roleTargetEntity,
    getMetadataEntityRelationProperties('roleTarget'),
  );

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
