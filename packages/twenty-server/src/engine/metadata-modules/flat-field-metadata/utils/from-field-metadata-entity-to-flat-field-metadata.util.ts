import { type FieldMetadataType } from 'twenty-shared/types';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  type FlatFieldMetadata,
  FIELD_METADATA_RELATION_PROPERTIES,
} from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const fromFieldMetadataEntityToFlatFieldMetadata = <
  T extends FieldMetadataType,
>(
  fieldMetadataEntity: FieldMetadataEntity<T>,
  // This is intended to be abstract
): FlatFieldMetadata => {
  const fieldMetadataWithoutRelations = removePropertiesFromRecord(
    fieldMetadataEntity,
    FIELD_METADATA_RELATION_PROPERTIES,
  );

  return {
    ...fieldMetadataWithoutRelations,
    kanbanAggregateOperationViewIds:
      fieldMetadataEntity.kanbanAggregateOperationViews.map(({ id }) => id),
    calendarViewIds: fieldMetadataEntity.calendarViews.map(({ id }) => id),
    mainGroupByFieldMetadataViewIds:
      fieldMetadataEntity.mainGroupByFieldMetadataViews.map(({ id }) => id),
    viewGroupIds: fieldMetadataEntity.viewGroups.map(({ id }) => id),
    viewFieldIds: fieldMetadataEntity.viewFields.map(({ id }) => id),
    viewFilterIds: fieldMetadataEntity.viewFilters.map(({ id }) => id),
    universalIdentifier:
      fieldMetadataWithoutRelations.standardId ??
      fieldMetadataWithoutRelations.id,
  };
};
