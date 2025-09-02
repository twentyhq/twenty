import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  computeMorphRelationFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const getReservedCompositeFieldNames = (
  flatObjectMetadata: FlatObjectMetadata,
): string[] => {
  return flatObjectMetadata.flatFieldMetadatas.flatMap((flatFieldMetadata) => {
    if (isCompositeFieldMetadataType(flatFieldMetadata.type)) {
      const base = flatFieldMetadata.name;
      const compositeType = compositeTypeDefinitions.get(
        flatFieldMetadata.type,
      );

      if (!isDefined(compositeType)) {
        return [];
      }

      return compositeType.properties.map((property) =>
        computeCompositeColumnName(base, property),
      );
    }

    return [];
  });
};

// Should implement Morph relation nameObjectId col availability
export const validateFlatFieldMetadataNameAvailability = ({
  flatFieldMetadata,
  flatObjectMetadata,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];
  const reservedCompositeFieldsNames =
    getReservedCompositeFieldNames(flatObjectMetadata);

  const flatFieldMetadataName = flatFieldMetadata.name;

  if (
    !isFlatFieldMetadataOfType(
      flatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    ) &&
    flatObjectMetadata.flatFieldMetadatas.some((existingFlatFieldMetadata) => {
      const firstDegreeCollision =
        existingFlatFieldMetadata.name === flatFieldMetadataName;
      const relationJoinColumnCollision =
        isFlatFieldMetadataOfType(
          existingFlatFieldMetadata,
          FieldMetadataType.RELATION,
        ) &&
        computeRelationFieldJoinColumnName(existingFlatFieldMetadata) ===
          flatFieldMetadataName;
      const morphRelationJoinColumnCollision =
        isFlatFieldMetadataOfType(
          existingFlatFieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        ) &&
        computeMorphRelationFieldJoinColumnName({
          name: existingFlatFieldMetadata.name,
          targetObjectMetadataNameSingular:
            existingFlatFieldMetadata.flatRelationTargetObjectMetadata
              .nameSingular,
        }) === flatFieldMetadataName;

      return (
        firstDegreeCollision ||
        relationJoinColumnCollision ||
        morphRelationJoinColumnCollision
      );
    })
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: flatFieldMetadataName,
      message: `Name "${flatFieldMetadataName}" is not available as it is already used by another field`,
      userFriendlyMessage: t`Name "${flatFieldMetadataName}" is not available as it is already used by another field`,
    });
  }

  if (reservedCompositeFieldsNames.includes(flatFieldMetadataName)) {
    errors.push({
      code: FieldMetadataExceptionCode.RESERVED_KEYWORD,
      message: `Name "${flatFieldMetadataName}" is reserved composite field name`,
      value: flatFieldMetadataName,
      userFriendlyMessage: t`Name "${flatFieldMetadataName}" is not available`,
    });
  }

  return errors;
};
