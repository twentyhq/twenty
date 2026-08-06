import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';

import { FieldActorSource } from '@/types';

export const nonEmptyStringFilterValueSchema = z.string().min(1);

const NUMERIC_VALUE = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

export const numericFilterValueSchema = z
  .string()
  .refine((value) => NUMERIC_VALUE.test(value.trim()), 'Expected a number')
  .transform((value) => parseFloat(value))
  .refine((value) => Number.isFinite(value), 'Expected a finite number');

const temporalSchema = <TParsed>(
  parse: (value: string) => TParsed,
  message: string,
) =>
  z.string().transform((value, ctx) => {
    try {
      return parse(value);
    } catch {
      ctx.addIssue({ code: 'custom', message });

      return z.NEVER;
    }
  });

export const plainDateFilterValueSchema = temporalSchema(
  (value) => Temporal.PlainDate.from(value),
  'Expected an ISO date, e.g. "2026-01-31"',
);

export const instantFilterValueSchema = temporalSchema(
  (value) => Temporal.Instant.from(value),
  'Expected an ISO date time, e.g. "2026-01-31T00:00:00Z"',
);

// The DATE_TIME "IS" reader narrows an instant down to a plain date in the
// viewer timezone, and the UI seeds that operand with a plain date, so both
// forms are accepted and the caller resolves the timezone.
export const plainDateOrInstantFilterValueSchema = temporalSchema(
  (value) =>
    value.includes('T')
      ? Temporal.Instant.from(value)
      : Temporal.PlainDate.from(value),
  'Expected an ISO date or date time',
);

export const booleanFilterValueSchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

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
