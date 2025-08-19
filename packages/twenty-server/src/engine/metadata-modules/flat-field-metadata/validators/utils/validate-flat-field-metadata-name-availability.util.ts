import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  FailedFlatFieldMetadataValidation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatFieldMetadataIdObjectIdAndName } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-id-object-id-and-name.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { InvalidMetadataExceptionCode } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

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
  flatFieldMetadata: { name, id, objectMetadataId },
  flatObjectMetadata,
}: {
  flatFieldMetadata: FlatFieldMetadataIdObjectIdAndName;
  flatObjectMetadata: FlatObjectMetadata;
}): FailedFlatFieldMetadataValidation[] => {
  const errors: FailedFlatFieldMetadataValidation[] = [];
  const reservedCompositeFieldsNames =
    getReservedCompositeFieldNames(flatObjectMetadata);

  if (
    flatObjectMetadata.flatFieldMetadatas.some(
      (field) =>
        field.name === name ||
        (isRelationFieldMetadataType(field.type) && `${field.name}Id` === name),
    )
  ) {
    errors.push({
      error: InvalidMetadataExceptionCode.NOT_AVAILABLE,
      id,
      message: `Name "${name}" is not available as it is already used by another field`,
      name,
      objectMetadataId,
      userFriendlyMessage: t`Name "${name}" is not available as it is already used by another field`,
    });
  }

  if (reservedCompositeFieldsNames.includes(name)) {
    errors.push({
      error: InvalidMetadataExceptionCode.RESERVED_KEYWORD,
      id,
      message: `Name "${name}" is reserved composite field name`,
      name,
      objectMetadataId,
      userFriendlyMessage: t`Name "${name}" is not available`,
    });
  }

  return errors;
};
