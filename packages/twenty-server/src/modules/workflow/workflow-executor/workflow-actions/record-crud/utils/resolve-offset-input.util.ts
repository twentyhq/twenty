import { isDefined } from 'twenty-shared/utils';

import { parseFiniteNumberInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/utils/parse-finite-number-input.util';

export const resolveOffsetInput = (
  value: number | string | undefined,
): number | undefined => {
  const parsedValue = parseFiniteNumberInput(value);

  if (!isDefined(parsedValue)) {
    return undefined;
  }

  return Math.max(0, Math.floor(parsedValue));
};
