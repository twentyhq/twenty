import { capitalize } from 'twenty-shared';

import { isDefined } from 'src/utils/is-defined';

export const formatColumnNameFromCompositeFieldAndSubfield = (
  fieldName: string,
  subFieldName?: string,
): string => {
  if (isDefined(subFieldName)) {
    return `${fieldName}${capitalize(subFieldName)}`;
  }

  return fieldName;
};
