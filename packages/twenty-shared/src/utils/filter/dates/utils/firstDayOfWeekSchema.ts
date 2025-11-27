import { FirstDayOfTheWeek as FirstDayOfTheWeekEnum } from '@/types/FirstDayOfTheWeek';
import z from 'zod';

export const firstDayOfWeekSchema = z.enum([
  FirstDayOfTheWeekEnum.MONDAY,
  FirstDayOfTheWeekEnum.SATURDAY,
  FirstDayOfTheWeekEnum.SUNDAY,
]);

export type FirstDayOfTheWeek = z.infer<typeof firstDayOfWeekSchema>;
