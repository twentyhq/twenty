import { type FieldMetadataDefaultSerializableValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

export const unserializeDefaultValue = (
  serializedDefaultValue: FieldMetadataDefaultSerializableValue,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  if (serializedDefaultValue === undefined || serializedDefaultValue === null) {
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
        // @ts-expect-error legacy noImplicitAny
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
