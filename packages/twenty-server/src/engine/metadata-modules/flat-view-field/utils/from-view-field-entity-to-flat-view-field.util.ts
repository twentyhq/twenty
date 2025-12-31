import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ALL_METADATA_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations-properties.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';

export const fromViewFieldEntityToFlatViewField = (
  viewFieldEntity: ViewFieldEntity,
): FlatViewField => {
  const viewFieldEntityWithoutRelations = removePropertiesFromRecord(
    viewFieldEntity,
    Object.keys(
      ALL_METADATA_RELATION_PROPERTIES.viewField,
    ) as (keyof typeof ALL_METADATA_RELATION_PROPERTIES.viewField)[],
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
