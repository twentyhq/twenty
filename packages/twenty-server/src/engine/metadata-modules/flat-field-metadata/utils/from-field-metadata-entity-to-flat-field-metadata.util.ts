import { type FieldMetadataType } from 'twenty-shared/types';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  type FlatFieldMetadata,
  fieldMetadataRelationProperties,
} from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const fromFieldMetadataEntityToFlatFieldMetadata = <
  T extends FieldMetadataType,
>(
  fieldMetadataEntity: FieldMetadataEntity<T>,
  // This is intended to be abstract
): FlatFieldMetadata => {
  const fieldMetadataWithoutRelations = removePropertiesFromRecord(
    fieldMetadataEntity,
    fieldMetadataRelationProperties,
  );

  return {
    ...fieldMetadataWithoutRelations,
    universalIdentifier:
      fieldMetadataWithoutRelations.standardId ??
      fieldMetadataWithoutRelations.id,
  };
};
