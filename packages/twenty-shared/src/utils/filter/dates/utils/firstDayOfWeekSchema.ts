import z from 'zod';

export const firstDayOfWeekSchema = z.enum(['MONDAY', 'SATURDAY', 'SUNDAY']);

export type FirstDayOfTheWeek = z.infer<typeof firstDayOfWeekSchema>;
