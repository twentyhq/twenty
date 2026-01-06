import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export const fromViewEntityToFlatView = (viewEntity: ViewEntity): FlatView => {
  const viewEntityWithoutRelations = removePropertiesFromRecord(
    viewEntity,
    getMetadataEntityRelationProperties('view'),
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
    viewFilterGroupIds:
      viewEntity.viewFilterGroups?.map(
        (viewFilterGroup) => viewFilterGroup.id,
      ) ?? [],
  };
};
