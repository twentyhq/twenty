import {
  FieldMetadataType,
  RelationAndMorphRelationFieldMetadataType,
} from 'twenty-shared/types';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  FieldMetadataEntityRelationProperties,
  FlatFieldMetadata,
  fieldMetadataRelationProperties,
} from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatRelationTargetFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-relation-target-field-metadata.type';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { fromObjectMetadataEntityToFlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/from-object-metadata-entity-to-flat-object-metadata-without-fields.util';

export const fromFieldMetadataEntityToFlatRelationTargetFieldMetadata = (
  fieldMetadataEntity: FieldMetadataEntity<RelationAndMorphRelationFieldMetadataType>,
): FlatRelationTargetFieldMetadata => {
  return {
    uniqueIdentifier: fieldMetadataEntity.standardId ?? fieldMetadataEntity.id,
    ...removePropertiesFromRecord(fieldMetadataEntity, [
      'relationTargetObjectMetadata',
      'relationTargetFieldMetadata',
    ]),
  };
};

// TODO refactor this method should not be recursive but depth 1
export const fromFieldMetadataEntityToFlatFieldMetadata = <
  T extends FieldMetadataType,
>(
  fieldMetadataEntity: FieldMetadataEntity<T>,
  // This is intended to be abstract
): FlatFieldMetadata => {
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
    const fieldMetadataWithoutRelations = removePropertiesFromRecord<
      FieldMetadataEntity<
        FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
      >,
      FieldMetadataEntityRelationProperties
    >(fieldMetadataEntity, fieldMetadataRelationProperties);

    if (
      !isFieldMetadataEntityOfType(
        fieldMetadataEntity.relationTargetFieldMetadata,
        FieldMetadataType.RELATION,
      )
    ) {
      throw new FieldMetadataException(
        'Relation target field is not a field metadata type relation',
        FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
      );
    }

    const flatRelationTargetFieldMetadata =
      fromFieldMetadataEntityToFlatRelationTargetFieldMetadata(
        fieldMetadataEntity.relationTargetFieldMetadata,
      );

    const flatRelationTargetObjectMetadata =
      fromObjectMetadataEntityToFlatObjectMetadataWithoutFields(
        fieldMetadataEntity.relationTargetObjectMetadata,
      );

    return {
      ...fieldMetadataWithoutRelations,
      uniqueIdentifier:
        fieldMetadataWithoutRelations.standardId ??
        fieldMetadataWithoutRelations.id,
      flatRelationTargetFieldMetadata,
      flatRelationTargetObjectMetadata,
      type: fieldMetadataEntity.type,
    } satisfies FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
  }

  const fieldMetadataWithoutRelations = removePropertiesFromRecord(
    fieldMetadataEntity,
    fieldMetadataRelationProperties,
  );

  return {
    ...fieldMetadataWithoutRelations,
    uniqueIdentifier:
      fieldMetadataWithoutRelations.standardId ??
      fieldMetadataWithoutRelations.id,
    flatRelationTargetFieldMetadata: null,
    flatRelationTargetObjectMetadata: null,
  };
};
