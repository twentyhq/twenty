import isEmpty from 'lodash.isempty';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

export const convertArguments = (args: any, fields: FieldMetadata[]): any => {
  const fieldsMap = new Map(
    fields.map((metadata) => [metadata.displayName, metadata]),
  );

  if (Array.isArray(args)) {
    return args.map((arg) => convertArguments(arg, fields));
  }

  const newArgs = {};

  for (const [key, value] of Object.entries(args)) {
    if (fieldsMap.has(key)) {
      const fieldMetadata = fieldsMap.get(key)!;

      if (typeof value === 'object' && value !== null && !isEmpty(value)) {
        for (const [subKey, subValue] of Object.entries(value)) {
          if (fieldMetadata.targetColumnMap[subKey]) {
            newArgs[fieldMetadata.targetColumnMap[subKey]] = subValue;
          }
        }
      } else {
        if (fieldMetadata.targetColumnMap.value) {
          newArgs[fieldMetadata.targetColumnMap.value] = value;
        }
      }
    } else {
      newArgs[key] = value;
    }
  }

  return newArgs;
};
