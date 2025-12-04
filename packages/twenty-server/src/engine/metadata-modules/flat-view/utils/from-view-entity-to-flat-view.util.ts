import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { VIEW_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-view/constants/view-entity-relation-properties.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export const fromViewEntityToFlatView = (viewEntity: ViewEntity): FlatView => {
  const viewEntityWithoutRelations = removePropertiesFromRecord(
    viewEntity,
    VIEW_ENTITY_RELATION_PROPERTIES,
  );

  return {
    ...viewEntityWithoutRelations,
    universalIdentifier:
      viewEntityWithoutRelations.universalIdentifier ??
      viewEntityWithoutRelations.id,
    viewFieldIds: viewEntity.viewFields.map((viewField) => viewField.id),
    viewFilterIds: viewEntity.viewFilters.map((viewFilter) => viewFilter.id),
    viewFilterGroupIds: viewEntity.viewFilterGroups.map(
      (viewFilterGroup) => viewFilterGroup.id,
    ),
    viewGroupIds: viewEntity.viewGroups.map((viewGroup) => viewGroup.id),
  };
};
