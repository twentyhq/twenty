import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import {
    FlatFieldMetadata,
    fieldMetadataRelationProperties,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

export const fromFieldMetadataEntityToFlatFieldMetadata = <
  T extends FieldMetadataType,
>(
  fieldMetadataEntity: FieldMetadataEntity<T>,
  // This is intented to be abstract
): FlatFieldMetadata => {
  const fieldMetadataWithoutRelations = removePropertiesFromRecord(
    fieldMetadataEntity,
    fieldMetadataRelationProperties,
  );

  if (
    isFieldMetadataEntityOfType(
      fieldMetadataEntity,
      FieldMetadataType.RELATION,
    ) ||
    isFieldMetadataEntityOfType(
      fieldMetadataEntity,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    const flatRelationTargetFieldMetadata =
      fromFieldMetadataEntityToFlatFieldMetadata(
        fieldMetadataEntity.relationTargetFieldMetadata,
      );
    const flatObjectTargetFieldMetadata = 
    return {
      ...fieldMetadataWithoutRelations,
      uniqueIdentifier:
        fieldMetadataWithoutRelations.standardId ??
        fieldMetadataWithoutRelations.id,
      flatRelationTargetFieldMetadata,
      flatRelationTargetObjectMetadata: {},
    } as FlatFieldMetadata<FieldMetadataType.RELATION>;
  }

  return {
    ...fieldMetadataWithoutRelations,
    uniqueIdentifier:
      fieldMetadataWithoutRelations.standardId ??
      fieldMetadataWithoutRelations.id,
    flatRelationTargetFieldMetadata: null,
    flatRelationTargetObjectMetadata: null,
  };
};
