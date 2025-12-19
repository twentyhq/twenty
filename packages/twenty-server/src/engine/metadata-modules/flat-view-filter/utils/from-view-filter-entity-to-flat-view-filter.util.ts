import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ALL_METADATA_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations-properties.constant';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';

export const fromViewFilterEntityToFlatViewFilter = (
  viewFilterEntity: ViewFilterEntity,
): FlatViewFilter => {
  const viewFilterEntityWithoutRelations = removePropertiesFromRecord(
    viewFilterEntity,
    Object.keys(
      ALL_METADATA_RELATION_PROPERTIES.viewFilter,
    ) as (keyof typeof ALL_METADATA_RELATION_PROPERTIES.viewFilter)[],
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
