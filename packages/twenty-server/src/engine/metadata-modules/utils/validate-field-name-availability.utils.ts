import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InvalidMetadataNameException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata-name.exception';

const getReservedCompositeFieldNames = (
  objectMetadata: ObjectMetadataEntity,
) => {
  const reservedCompositeFieldsNames: string[] = [];

  for (const field of objectMetadata.fields) {
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
  objectMetadata: ObjectMetadataEntity,
) => {
  const reservedCompositeFieldsNames =
    getReservedCompositeFieldNames(objectMetadata);

  if (objectMetadata.fields.some((field) => field.name === name)) {
    throw new InvalidMetadataNameException(`Name "${name}" is not available`);
  }

  if (reservedCompositeFieldsNames.includes(name)) {
    throw new InvalidMetadataNameException(`Name "${name}" is not available`);
  }
};
