import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

const getReservedCompositeFieldsNames = (
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

export const validateNameAvailabilityOrThrow = (
  name: string,
  objectMetadata: ObjectMetadataEntity,
) => {
  const reservedCompositeFieldsNames =
    getReservedCompositeFieldsNames(objectMetadata);

  if (reservedCompositeFieldsNames.includes(name)) {
    throw new NameNotAvailableException(name);
  }
};

export class NameNotAvailableException extends Error {
  constructor(name: string) {
    const message = `Name "${name}" is not available`;

    super(message);
  }
}
