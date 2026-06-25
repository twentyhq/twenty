import { type RelativeDateFilterUnit } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';

// Sub-day units (second/minute/hour) have no calendar-period boundary, so
// relative filters keep a rolling window for them and the date-time picker
// shows the resolved window as text instead of a month calendar. Keeping this
// classification in one place keeps the resolver and the picker in lockstep.
const SUB_DAY_RELATIVE_DATE_FILTER_UNITS: readonly RelativeDateFilterUnit[] = [
  'SECOND',
  'MINUTE',
  'HOUR',
];

export const isSubDayRelativeDateFilterUnit = (
  unit: RelativeDateFilterUnit,
): boolean => SUB_DAY_RELATIVE_DATE_FILTER_UNITS.includes(unit);
