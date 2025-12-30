import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ALL_METADATA_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations-properties.constant';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';

export const fromViewFilterGroupEntityToFlatViewFilterGroup = (
  viewFilterGroupEntity: ViewFilterGroupEntity,
): FlatViewFilterGroup => {
  const viewFilterGroupEntityWithoutRelations = removePropertiesFromRecord(
    viewFilterGroupEntity,
    Object.keys(
      ALL_METADATA_RELATION_PROPERTIES.viewFilterGroup,
    ) as (keyof typeof ALL_METADATA_RELATION_PROPERTIES.viewFilterGroup)[],
  );

  return {
    ...viewFilterGroupEntityWithoutRelations,
    createdAt: viewFilterGroupEntity.createdAt.toISOString(),
    updatedAt: viewFilterGroupEntity.updatedAt.toISOString(),
    deletedAt: viewFilterGroupEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      viewFilterGroupEntityWithoutRelations.universalIdentifier ??
      viewFilterGroupEntityWithoutRelations.id,
  };
};

