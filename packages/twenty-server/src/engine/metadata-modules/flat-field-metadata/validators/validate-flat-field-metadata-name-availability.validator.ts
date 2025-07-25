import { t } from '@lingui/core/macro';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-result.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const getReservedCompositeFieldNames = (
  flatObjectMetadatas: FlatObjectMetadata,
): string[] => {
  return flatObjectMetadatas.flatFieldMetadatas.flatMap((flatFieldMetadata) => {
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
}): FailedFlatFieldMetadataValidation | undefined => {
  const reservedCompositeFieldsNames =
    getReservedCompositeFieldNames(objectMetadata);

  if (
    objectMetadata.flatFieldMetadatas.some(
      (field) =>
        field.name === name ||
        // TODO check if need to look for morph here too ?
        (field.type === FieldMetadataType.RELATION &&
          `${field.name}Id` === name),
    )
  ) {
    return {
      status: 'fail',
      error: new InvalidMetadataException(
        `Name "${name}" is not available as it is already used by another field`,
        InvalidMetadataExceptionCode.NOT_AVAILABLE,
        {
          userFriendlyMessage: t`This name is not available as it is already used by another field`,
        },
      ),
    };
  }

  if (reservedCompositeFieldsNames.includes(name)) {
    return {
      status: 'fail',
      error: new InvalidMetadataException(
        `Name "${name}" is not available`,
        InvalidMetadataExceptionCode.RESERVED_KEYWORD,
        {
          userFriendlyMessage: t`This name is not available.`,
        },
      ),
    };
  }

  return undefined;
};
