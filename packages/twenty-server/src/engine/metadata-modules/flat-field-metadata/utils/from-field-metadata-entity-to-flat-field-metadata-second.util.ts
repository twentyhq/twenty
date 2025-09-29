import {
  FieldMetadataType
} from 'twenty-shared/types';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FlatFieldMetadataSecond,
  fieldMetadataRelationProperties
} from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const fromFieldMetadataEntityToFlatFieldMetadataSecond = <
  T extends FieldMetadataType,
>(
  fieldMetadataEntity: FieldMetadataEntity<T>,
): FlatFieldMetadataSecond => {
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
