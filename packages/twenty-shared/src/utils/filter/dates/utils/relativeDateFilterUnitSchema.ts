import z from 'zod';

export const relativeDateFilterUnitSchema = z.enum([
  'SECOND',
  'MINUTE',
  'HOUR',
  'DAY',
  'WEEK',
  'MONTH',
  'YEAR',
]);

export type RelativeDateFilterUnit = z.infer<
  typeof relativeDateFilterUnitSchema
>;
