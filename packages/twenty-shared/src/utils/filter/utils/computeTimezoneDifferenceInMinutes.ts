import { tzOffset } from '@date-fns/tz';

export const computeTimezoneDifferenceInMinutes = (
  timezoneA: string,
  timezoneB: string,
  referenceDateForDST: Date,
) => {
  const minutesOffsetA = tzOffset(timezoneA, referenceDateForDST);
  const minutesOffsetB = tzOffset(timezoneB, referenceDateForDST);

  return minutesOffsetB - minutesOffsetA;
};
