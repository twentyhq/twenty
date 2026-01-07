import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';

export const fromViewFilterGroupEntityToFlatViewFilterGroup = (
  viewFilterGroupEntity: ViewFilterGroupEntity,
): FlatViewFilterGroup => {
  const viewFilterGroupEntityWithoutRelations = removePropertiesFromRecord(
    viewFilterGroupEntity,
    getMetadataEntityRelationProperties('viewFilterGroup'),
  );

  return {
    ...viewFilterGroupEntityWithoutRelations,
    createdAt: viewFilterGroupEntity.createdAt.toISOString(),
    updatedAt: viewFilterGroupEntity.updatedAt.toISOString(),
    deletedAt: viewFilterGroupEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      viewFilterGroupEntityWithoutRelations.universalIdentifier ??
      viewFilterGroupEntityWithoutRelations.id,
    viewFilterIds:
      viewFilterGroupEntity.viewFilters?.map((viewFilter) => viewFilter.id) ??
      [],
    childViewFilterGroupIds:
      viewFilterGroupEntity.childViewFilterGroups?.map(
        (childGroup) => childGroup.id,
      ) ?? [],
  };
};
