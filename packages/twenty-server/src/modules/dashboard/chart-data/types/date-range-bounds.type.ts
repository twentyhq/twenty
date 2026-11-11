import { type Temporal } from 'temporal-polyfill';

export type DateRangeBounds = {
  start: Temporal.PlainDate | null;
  end: Temporal.PlainDate | null;
};
