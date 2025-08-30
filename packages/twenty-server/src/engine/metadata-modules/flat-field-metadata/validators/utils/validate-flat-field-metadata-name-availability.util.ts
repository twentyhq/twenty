import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
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

export const validateFlatFieldMetadataNameAvailability = ({
  name,
  flatObjectMetadata,
}: {
  name: string;
  flatObjectMetadata: FlatObjectMetadata;
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];
  const reservedCompositeFieldsNames =
    getReservedCompositeFieldNames(flatObjectMetadata);

  if (
    flatObjectMetadata.flatFieldMetadatas.some(
      (field) =>
        field.name === name ||
        (isMorphOrRelationFieldMetadataType(field.type) &&
          `${field.name}Id` === name),
    )
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.NOT_AVAILABLE,
      value: name,
      message: `Name "${name}" is not available as it is already used by another field`,
      userFriendlyMessage: t`Name "${name}" is not available as it is already used by another field`,
    });
  }

  if (reservedCompositeFieldsNames.includes(name)) {
    errors.push({
      code: FieldMetadataExceptionCode.RESERVED_KEYWORD,
      message: `Name "${name}" is reserved composite field name`,
      value: name,
      userFriendlyMessage: t`Name "${name}" is not available`,
    });
  }

  return errors;
};
