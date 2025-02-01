import { capitalize } from 'twenty-shared';

import { isDefined } from 'twenty-shared';

export const formatColumnNamesFromCompositeFieldAndSubfields = (
  fieldName: string,
  subFieldNames?: string[],
): string[] => {
  if (isDefined(subFieldNames)) {
    return subFieldNames.map(
      (subFieldName) => `${fieldName}${capitalize(subFieldName)}`,
    );
  }

  return [fieldName];
};
