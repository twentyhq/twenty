import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { VIEW_FIELD_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-view-field/constants/view-field-entity-relation-properties.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';

export const fromViewFieldEntityToFlatViewField = (
  viewFieldEntity: ViewFieldEntity,
): FlatViewField => {
  const viewFieldEntityWithoutRelations = removePropertiesFromRecord(
    viewFieldEntity,
    VIEW_FIELD_ENTITY_RELATION_PROPERTIES,
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
