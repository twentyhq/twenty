import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { parseFiniteNumberInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/utils/parse-finite-number-input.util';

export const resolveLimitInput = (
  value: number | string | undefined,
): number | undefined => {
  const parsedValue = parseFiniteNumberInput(value);

  if (!isDefined(parsedValue)) {
    return undefined;
  }

  return Math.min(Math.max(Math.floor(parsedValue), 1), QUERY_MAX_RECORDS);
};
