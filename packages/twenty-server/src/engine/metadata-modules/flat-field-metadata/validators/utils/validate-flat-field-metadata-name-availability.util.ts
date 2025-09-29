import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import {
  FlatFieldMetadataSecond
} from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

const getReservedCompositeFieldNames = (
  objectFlatFieldMetadatas: FlatFieldMetadataSecond[],
): string[] => {
  return objectFlatFieldMetadatas.flatMap((flatFieldMetadata) => {
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
  objectFlatFieldMetadatas,
}: {
  flatFieldMetadata: FlatFieldMetadataSecond;
  objectFlatFieldMetadatas: FlatFieldMetadataSecond[];
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];
  const reservedCompositeFieldsNames = getReservedCompositeFieldNames(
    objectFlatFieldMetadatas,
  );
  const flatFieldMetadataName = flatFieldMetadata.name;

  if (
    !isFlatFieldMetadataOfType(
      flatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    ) &&
    objectFlatFieldMetadatas.some((existingFlatFieldMetadata) => {
      const firstDegreeCollision =
        existingFlatFieldMetadata.name === flatFieldMetadataName;
      const relationJoinColumnCollision =
        isMorphOrRelationFlatFieldMetadata(existingFlatFieldMetadata) &&
        existingFlatFieldMetadata.flatRelationTargetFieldMetadata.settings
          .joinColumnName === flatFieldMetadataName;

      return firstDegreeCollision || relationJoinColumnCollision;
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
