import { type Temporal } from 'temporal-polyfill';

export type ExpressionDate =
  | { isDateOnly: true; date: Temporal.PlainDate }
  | { isDateOnly: false; dateTime: Temporal.ZonedDateTime };
