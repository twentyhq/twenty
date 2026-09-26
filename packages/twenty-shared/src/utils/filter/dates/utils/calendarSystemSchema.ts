import z from 'zod';

export const calendarSystemSchema = z.enum([
  'gregory',
  'persian',
  'islamic-umalqura',
]);

export type CalendarSystemSchema = z.infer<typeof calendarSystemSchema>;
