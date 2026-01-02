import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';

export const fromViewFieldEntityToFlatViewField = (
  viewFieldEntity: ViewFieldEntity,
): FlatViewField => {
  const viewFieldEntityWithoutRelations = removePropertiesFromRecord(
    viewFieldEntity,
    getMetadataEntityRelationProperties('viewField'),
  );

  return {
    ...viewFieldEntityWithoutRelations,
    createdAt: viewFieldEntity.createdAt.toISOString(),
    updatedAt: viewFieldEntity.updatedAt.toISOString(),
    deletedAt: viewFieldEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      viewFieldEntityWithoutRelations.universalIdentifier ??
      viewFieldEntityWithoutRelations.id,
  };
};
