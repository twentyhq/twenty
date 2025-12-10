import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { VIEW_FILTER_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter/constants/view-filter-entity-relation-properties.constant';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';

export const fromViewFilterEntityToFlatViewFilter = (
  viewFilterEntity: ViewFilterEntity,
): FlatViewFilter => {
  const viewFilterEntityWithoutRelations = removePropertiesFromRecord(
    viewFilterEntity,
    VIEW_FILTER_ENTITY_RELATION_PROPERTIES,
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
