import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

const getReservedCompositeFieldNames = (
  fieldMetadataMapById: FieldMetadataMap,
) => {
  const reservedCompositeFieldsNames: string[] = [];

  for (const field of Object.values(fieldMetadataMapById)) {
    if (isCompositeFieldMetadataType(field.type)) {
      const base = field.name;
      const compositeType = compositeTypeDefinitions.get(field.type);

      compositeType?.properties.map((property) =>
        reservedCompositeFieldsNames.push(
          computeCompositeColumnName(base, property),
        ),
      );
    }
  }

  return reservedCompositeFieldsNames;
};

type ValidateFieldNameAvailabilityOrThrowArgs = {
  name: string;
  fieldMetadataMapById: FieldMetadataMap;
};
export const validateFieldNameAvailabilityOrThrow = ({
  name,
  fieldMetadataMapById,
}: ValidateFieldNameAvailabilityOrThrowArgs) => {
  const reservedCompositeFieldsNames =
    getReservedCompositeFieldNames(fieldMetadataMapById);

  if (
    Object.values(fieldMetadataMapById).some(
      (field) =>
        field.name === name ||
        (field.type === FieldMetadataType.RELATION &&
          `${field.name}Id` === name),
    )
  ) {
    throw new InvalidMetadataException(
      `Name "${name}" is not available as it is already used by another field`,
      InvalidMetadataExceptionCode.NOT_AVAILABLE,
      {
        userFriendlyMessage: msg`This name is not available as it is already used by another field.`,
      },
    );
  }

  if (reservedCompositeFieldsNames.includes(name)) {
    throw new InvalidMetadataException(
      `Name "${name}" is not available`,
      InvalidMetadataExceptionCode.RESERVED_KEYWORD,
      {
        userFriendlyMessage: msg`This name is not available.`,
      },
    );
  }
};
