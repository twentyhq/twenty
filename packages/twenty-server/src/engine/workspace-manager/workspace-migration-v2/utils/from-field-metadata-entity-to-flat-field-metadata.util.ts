import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import {
  FlatFieldMetadata,
  fieldMetadataRelationProperties,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/utils/from-object-metadata-entity-to-flat-field-metadata.util';
import { fromFlatObjectMetadataToFlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/from-flat-object-metadata-to-flat-object-metadata-without-fields.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

export const fromFieldMetadataEntityToFlatFieldMetadata = <
  T extends FieldMetadataType,
>(
  fieldMetadataEntity: FieldMetadataEntity<T>,
  /**
   * private depth bottleneck
   */
  _depth?: number,
  // This is intented to be abstract
): FlatFieldMetadata => {
  if (isDefined(_depth) && _depth > 1) {
    throw new Error('TODO prastoin entering a possible infinite loop');
  }

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
    const newDepth = isDefined(_depth) ? _depth + 1 : 1;
    const flatRelationTargetFieldMetadata =
      fromFieldMetadataEntityToFlatFieldMetadata(
        fieldMetadataEntity.relationTargetFieldMetadata,
        newDepth,
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
