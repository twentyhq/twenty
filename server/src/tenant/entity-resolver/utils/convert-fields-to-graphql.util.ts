import isEmpty from 'lodash.isempty';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

export const convertFieldsToGraphQL = (
  select: any,
  fields: FieldMetadata[],
  acc = '',
) => {
  const fieldsMap = new Map(
    // TODO: Handle plural for fields when we add relations
    fields.map((metadata) => [metadata.nameSingular, metadata]),
  );

  for (const [key, value] of Object.entries(select)) {
    let fieldAlias = key;

    if (fieldsMap.has(key)) {
      const metadata = fieldsMap.get(key)!;
      const entries = Object.entries(metadata.targetColumnMap);

      if (entries.length > 0) {
        // If there is only one value, use it as the alias
        if (entries.length === 1) {
          const alias = entries[0][1];

          fieldAlias = `${key}: ${alias}`;
        } else {
          // Otherwise it means it's a special type with multiple values, so we need fetch all fields
          fieldAlias = `
          ${entries
            .map(
              ([key, value]) => `___${metadata.nameSingular}_${key}: ${value}`,
            )
            .join('\n')}
        `;
        }
      }
    }

    // Recurse if value is a nested object, otherwise append field or alias
    if (
      !fieldsMap.has(key) &&
      value &&
      typeof value === 'object' &&
      !isEmpty(value)
    ) {
      acc += `${key} {\n`;
      acc = convertFieldsToGraphQL(value, fields, acc); // recursive call with updated accumulator
      acc += `}\n`;
    } else {
      acc += `${fieldAlias}\n`;
    }
  }

  return acc;
};
