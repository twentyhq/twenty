import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { VIEW_GROUP_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-view-group/constants/view-group-entity-relation-properties.constant';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';

export const fromViewGroupEntityToFlatViewGroup = (
  viewGroupEntity: ViewGroupEntity,
): FlatViewGroup => {
  const viewGroupEntityWithoutRelations = removePropertiesFromRecord(
    viewGroupEntity,
    VIEW_GROUP_ENTITY_RELATION_PROPERTIES,
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
