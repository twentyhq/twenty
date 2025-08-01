import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

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
  objectMetadata,
}: {
  name: string;
  objectMetadata: FlatObjectMetadata;
}): FailedFlatFieldMetadataValidationExceptions | undefined => {
  const reservedCompositeFieldsNames =
    getReservedCompositeFieldNames(objectMetadata);

  if (
    objectMetadata.flatFieldMetadatas.some(
      (field) =>
        field.name === name ||
        (field.type === FieldMetadataType.RELATION && // Question: Should we also look for MORPH_RELATION field types ?
          `${field.name}Id` === name),
    )
  ) {
    return new InvalidMetadataException(
      `Name "${name}" is not available as it is already used by another field`,
      InvalidMetadataExceptionCode.NOT_AVAILABLE,
      {
        userFriendlyMessage: t`This name is not available as it is already used by another field`,
      },
    );
  }

  if (reservedCompositeFieldsNames.includes(name)) {
    return new InvalidMetadataException(
      `Name "${name}" is not available`,
      InvalidMetadataExceptionCode.RESERVED_KEYWORD,
      {
        userFriendlyMessage: t`This name is not available.`,
      },
    );
  }

  return undefined;
};
