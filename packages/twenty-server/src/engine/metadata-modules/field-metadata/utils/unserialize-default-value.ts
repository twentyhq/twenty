import { FieldMetadataDefaultSerializableValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

export const unserializeDefaultValue = (
  serializedDefaultValue: FieldMetadataDefaultSerializableValue,
): any => {
  if (serializedDefaultValue === null) {
    return null;
  }

  if (typeof serializedDefaultValue === 'number') {
    return serializedDefaultValue;
  }

  if (typeof serializedDefaultValue === 'boolean') {
    return serializedDefaultValue;
  }

  if (typeof serializedDefaultValue === 'string') {
    return serializedDefaultValue.replace(/'/g, '');
  }

  if (Array.isArray(serializedDefaultValue)) {
    return serializedDefaultValue.map((value) =>
      unserializeDefaultValue(value),
    );
  }

  if (typeof serializedDefaultValue === 'object') {
    return Object.entries(serializedDefaultValue).reduce(
      (acc, [key, value]) => {
        acc[key] = unserializeDefaultValue(value);

        return acc;
      },
      {},
    );
  }

  throw new Error(
    `Invalid serialized default value "${serializedDefaultValue}"`,
  );
};
