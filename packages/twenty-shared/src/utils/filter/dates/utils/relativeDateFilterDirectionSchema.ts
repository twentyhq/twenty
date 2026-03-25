import z from 'zod';

export const relativeDateFilterDirectionSchema = z.enum([
  'NEXT',
  'THIS',
  'PAST',
]);

export type RelativeDateFilterDirection = z.infer<
  typeof relativeDateFilterDirectionSchema
>;
