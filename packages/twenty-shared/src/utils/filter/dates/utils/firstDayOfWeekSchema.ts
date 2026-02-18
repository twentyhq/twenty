import { FirstDayOfTheWeek } from '@/types';
import z from 'zod';

export const firstDayOfWeekSchema = z.enum([
  FirstDayOfTheWeek.MONDAY,
  FirstDayOfTheWeek.SATURDAY,
  FirstDayOfTheWeek.SUNDAY,
]);

export type FirstDayOfTheWeekSchema = z.infer<typeof firstDayOfWeekSchema>;
