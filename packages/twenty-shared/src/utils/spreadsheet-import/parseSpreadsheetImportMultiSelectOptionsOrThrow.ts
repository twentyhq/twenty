import { z } from 'zod';

import { parseJson } from '@/utils/parseJson';

export const parseSpreadsheetImportMultiSelectOptionsOrThrow = (
  value: unknown,
) => {
  const stringValue = z.string().parse(value);
  const parsedValue = parseJson<unknown>(stringValue);

  return Array.isArray(parsedValue)
    ? parsedValue
    : stringValue.split(',').map((item) => item.trim());
};
