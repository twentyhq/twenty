import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';

export const fromViewGroupEntityToFlatViewGroup = (
  viewGroupEntity: ViewGroupEntity,
): FlatViewGroup => {
  const viewGroupEntityWithoutRelations = removePropertiesFromRecord(
    viewGroupEntity,
    getMetadataEntityRelationProperties('viewGroup'),
  );

  return {
    ...viewGroupEntityWithoutRelations,
    createdAt: viewGroupEntity.createdAt.toISOString(),
    updatedAt: viewGroupEntity.updatedAt.toISOString(),
    deletedAt: viewGroupEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      viewGroupEntityWithoutRelations.universalIdentifier ??
      viewGroupEntityWithoutRelations.id,
  };
};
