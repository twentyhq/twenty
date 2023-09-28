import isEmpty from 'lodash.isempty';

export const convertFieldsToGraphQL = (
  fields: any,
  fieldAliases: Record<string, string>,
  acc = '',
) => {
  for (const [key, value] of Object.entries(fields)) {
    if (value && !isEmpty(value)) {
      acc += `${key} {\n`;
      acc = convertFieldsToGraphQL(value, fieldAliases, acc);
      acc += `}\n`;
    } else {
      if (fieldAliases[key]) {
        acc += `${key}: ${fieldAliases[key]}\n`;
      } else {
        acc += `${key}\n`;
      }
    }
  }

  return acc;
};
