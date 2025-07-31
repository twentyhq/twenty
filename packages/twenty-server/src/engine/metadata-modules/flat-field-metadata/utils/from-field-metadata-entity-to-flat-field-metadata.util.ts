import { FieldMetadataType } from 'twenty-shared/types';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataEntityRelationProperties,
  FlatFieldMetadata,
  fieldMetadataRelationProperties,
} from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { fromFlatObjectMetadataToFlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/from-flat-object-metadata-to-flat-object-metadata-without-fields.util';

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

    const flatRelationTargetFieldMetadata =
      fromFieldMetadataEntityToFlatFieldMetadata(
        fieldMetadataEntity.relationTargetFieldMetadata,
      );

    const flatObjectTargetFieldMetadata =
      fromObjectMetadataEntityToFlatObjectMetadata(
        fieldMetadataEntity.relationTargetObjectMetadata,
      );
    const flatRelationTargetObjectMetadata =
      fromFlatObjectMetadataToFlatObjectMetadataWithoutFields(
        flatObjectTargetFieldMetadata,
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
