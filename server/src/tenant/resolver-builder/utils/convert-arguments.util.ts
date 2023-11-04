import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';

export const convertArguments = (
  args: any,
  fields: FieldMetadataInterface[],
): any => {
  const fieldsMap = new Map(
    fields.map((metadata) => [metadata.name, metadata]),
  );

  const processObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => processObject(item));
    }

    const newObj = {};

    for (const [key, value] of Object.entries(obj)) {
      const fieldMetadata = fieldsMap.get(key);

      if (
        fieldMetadata &&
        typeof value === 'object' &&
        value !== null &&
        Object.values(fieldMetadata.targetColumnMap).length > 1
      ) {
        for (const [subKey, subValue] of Object.entries(value)) {
          const mappedKey = fieldMetadata.targetColumnMap[subKey];

          if (mappedKey) {
            newObj[mappedKey] = subValue;
          }
        }
      } else if (fieldMetadata) {
        const mappedKey = fieldMetadata.targetColumnMap.value;

        if (mappedKey) {
          newObj[mappedKey] = value;
        }
      } else {
        newObj[key] = processObject(value);
      }
    }

    return newObj;
  };

  return processObject(args);
};
