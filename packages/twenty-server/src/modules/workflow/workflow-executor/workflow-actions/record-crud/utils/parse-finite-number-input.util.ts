import { z } from 'zod';

const finiteNumberInputSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.coerce.number().finite(),
);

export const parseFiniteNumberInput = (
  value: number | string | undefined,
): number | undefined => {
  const result = finiteNumberInputSchema.safeParse(value);

  return result.success ? result.data : undefined;
};
