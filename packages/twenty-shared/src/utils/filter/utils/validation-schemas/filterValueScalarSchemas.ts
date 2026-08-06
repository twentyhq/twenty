import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';

import { FieldActorSource } from '@/types';

export const nonEmptyStringFilterValueSchema = z.string().min(1);

export const numericFilterValueSchema = z
  .string()
  .refine((value) => !Number.isNaN(parseFloat(value)), 'Expected a number');

export const plainDateFilterValueSchema = z.string().refine((value) => {
  try {
    Temporal.PlainDate.from(value);
    return true;
  } catch {
    return false;
  }
}, 'Expected an ISO date, e.g. "2026-01-31"');

export const instantFilterValueSchema = z.string().refine((value) => {
  try {
    Temporal.Instant.from(value);
    return true;
  } catch {
    return false;
  }
}, 'Expected an ISO date time, e.g. "2026-01-31T00:00:00Z"');

// The DATE_TIME "IS" reader narrows an instant down to a plain date, and the UI
// seeds this operand with a plain date, so both forms have to be accepted.
export const plainDateOrInstantFilterValueSchema = z
  .string()
  .refine(
    (value) =>
      (value.includes('T')
        ? instantFilterValueSchema
        : plainDateFilterValueSchema
      ).safeParse(value).success,
    'Expected an ISO date or date time',
  );

export const booleanFilterValueSchema = z.enum(['true', 'false']);

export const actorSourceFilterValueSchema = z
  .string()
  .transform((value, ctx) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      ctx.addIssue({
        code: 'custom',
        message: (error as Error).message,
      });
      return z.NEVER;
    }
  })
  .pipe(z.array(z.enum(FieldActorSource)));
