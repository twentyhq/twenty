import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';

export const fromViewSortEntityToFlatViewSort = (
  viewSortEntity: ViewSortEntity,
): FlatViewSort => {
  const viewSortEntityWithoutRelations = removePropertiesFromRecord(
    viewSortEntity,
    getMetadataEntityRelationProperties('viewSort'),
  );

  return {
    ...viewSortEntityWithoutRelations,
    createdAt: viewSortEntity.createdAt.toISOString(),
    updatedAt: viewSortEntity.updatedAt.toISOString(),
    deletedAt: viewSortEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      viewSortEntityWithoutRelations.universalIdentifier ??
      viewSortEntityWithoutRelations.id,
  };
};
