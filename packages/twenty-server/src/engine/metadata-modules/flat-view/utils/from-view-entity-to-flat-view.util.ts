import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ALL_METADATA_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations-properties.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export const fromViewEntityToFlatView = (viewEntity: ViewEntity): FlatView => {
  const viewEntityWithoutRelations = removePropertiesFromRecord(
    viewEntity,
    Object.keys(
      ALL_METADATA_RELATION_PROPERTIES.view,
    ) as (keyof typeof ALL_METADATA_RELATION_PROPERTIES.view)[],
  );

  return {
    ...viewEntityWithoutRelations,
    createdAt: viewEntity.createdAt.toISOString(),
    updatedAt: viewEntity.updatedAt.toISOString(),
    deletedAt: viewEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      viewEntityWithoutRelations.universalIdentifier ??
      viewEntityWithoutRelations.id,
    viewFieldIds: viewEntity.viewFields.map((viewField) => viewField.id),
    viewFilterIds: viewEntity.viewFilters.map((viewFilter) => viewFilter.id),
    viewGroupIds: viewEntity.viewGroups.map((viewGroup) => viewGroup.id),
    viewFilterGroupIds: viewEntity.viewFilterGroups?.map(
      (viewFilterGroup) => viewFilterGroup.id,
    ) ?? [],
  };
};
