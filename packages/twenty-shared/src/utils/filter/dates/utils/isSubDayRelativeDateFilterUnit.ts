import { type RelativeDateFilterUnit } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';

const SUB_DAY_RELATIVE_DATE_FILTER_UNITS: readonly RelativeDateFilterUnit[] = [
  'SECOND',
  'MINUTE',
  'HOUR',
];

export const isSubDayRelativeDateFilterUnit = (
  unit: RelativeDateFilterUnit,
): boolean => SUB_DAY_RELATIVE_DATE_FILTER_UNITS.includes(unit);
