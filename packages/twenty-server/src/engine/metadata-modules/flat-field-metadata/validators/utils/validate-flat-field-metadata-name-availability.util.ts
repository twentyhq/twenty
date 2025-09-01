import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';

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

  if (
    !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
    flatObjectMetadata.flatFieldMetadatas.some(
      (field) =>
        field.name === flatFieldMetadata.name ||
        (isMorphOrRelationFieldMetadataType(field.type) &&
          `${field.name}Id` === flatFieldMetadata.name),
    )
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: name,
      message: `Name "${name}" is not available as it is already used by another field`,
      userFriendlyMessage: t`Name "${name}" is not available as it is already used by another field`,
    });
  }

  if (reservedCompositeFieldsNames.includes(flatFieldMetadata.name)) {
    errors.push({
      code: FieldMetadataExceptionCode.RESERVED_KEYWORD,
      message: `Name "${name}" is reserved composite field name`,
      value: name,
      userFriendlyMessage: t`Name "${name}" is not available`,
    });
  }

  return errors;
};
