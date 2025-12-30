import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ALL_METADATA_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations-properties.constant';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';

export const fromViewGroupEntityToFlatViewGroup = (
  viewGroupEntity: ViewGroupEntity,
): FlatViewGroup => {
  const viewGroupEntityWithoutRelations = removePropertiesFromRecord(
    viewGroupEntity,
    Object.keys(
      ALL_METADATA_RELATION_PROPERTIES.viewGroup,
    ) as (keyof typeof ALL_METADATA_RELATION_PROPERTIES.viewGroup)[],
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
