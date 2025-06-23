import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

const getReservedCompositeFieldNames = (
  objectMetadata: ObjectMetadataItemWithFieldMaps,
) => {
  const reservedCompositeFieldsNames: string[] = [];

  for (const field of Object.values(objectMetadata.fieldsById)) {
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

export const validateFieldNameAvailabilityOrThrow = (
  name: string,
  objectMetadata: ObjectMetadataItemWithFieldMaps,
) => {
  const reservedCompositeFieldsNames =
    getReservedCompositeFieldNames(objectMetadata);

  if (
    Object.values(objectMetadata.fieldsById).some(
      (field) => field.name === name,
    )
  ) {
    throw new InvalidMetadataException(
      `Name "${name}" is not available`,
      InvalidMetadataExceptionCode.NOT_AVAILABLE,
    );
  }

  if (reservedCompositeFieldsNames.includes(name)) {
    throw new InvalidMetadataException(
      `Name "${name}" is not available`,
      InvalidMetadataExceptionCode.RESERVED_KEYWORD,
    );
  }
};
