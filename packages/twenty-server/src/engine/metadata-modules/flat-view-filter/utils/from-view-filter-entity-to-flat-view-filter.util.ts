import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';

export const fromViewFilterEntityToFlatViewFilter = (
  viewFilterEntity: ViewFilterEntity,
): FlatViewFilter => {
  const viewFilterEntityWithoutRelations = removePropertiesFromRecord(
    viewFilterEntity,
    getMetadataEntityRelationProperties('viewFilter'),
  );

  return {
    ...viewFilterEntityWithoutRelations,
    createdAt: viewFilterEntity.createdAt.toISOString(),
    updatedAt: viewFilterEntity.updatedAt.toISOString(),
    deletedAt: viewFilterEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      viewFilterEntityWithoutRelations.universalIdentifier ??
      viewFilterEntityWithoutRelations.id,
  };
};
