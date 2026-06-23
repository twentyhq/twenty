import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewGroupEntityToFlatViewGroup = (
  args: FromEntityToFlatEntityArgs<'viewGroup'>,
): FlatViewGroup => {
  const { entity: viewGroupEntity } = args;

  const viewGroupEntityWithoutRelations = removePropertiesFromRecord(
    viewGroupEntity,
    getMetadataEntityRelationProperties('viewGroup'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewGroup',
      ...args,
    });

  return {
    ...viewGroupEntityWithoutRelations,
    createdAt: viewGroupEntity.createdAt.toISOString(),
    updatedAt: viewGroupEntity.updatedAt.toISOString(),
    deletedAt: viewGroupEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: viewGroupEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
