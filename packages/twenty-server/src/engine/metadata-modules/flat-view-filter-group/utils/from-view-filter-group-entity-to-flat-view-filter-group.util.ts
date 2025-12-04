import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { VIEW_FILTER_GROUP_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter-group/constants/view-filter-group-entity-relation-properties.constant';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';

export const fromViewFilterGroupEntityToFlatViewFilterGroup = (
  viewFilterGroupEntity: ViewFilterGroupEntity,
): FlatViewFilterGroup => {
  const viewFilterGroupEntityWithoutRelations = removePropertiesFromRecord(
    viewFilterGroupEntity,
    VIEW_FILTER_GROUP_ENTITY_RELATION_PROPERTIES,
  );

  return {
    ...viewFilterGroupEntityWithoutRelations,
    universalIdentifier:
      viewFilterGroupEntityWithoutRelations.universalIdentifier ??
      viewFilterGroupEntityWithoutRelations.id,
  };
};

