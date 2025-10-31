import { computeTimezoneDifferenceInMinutes } from '@/utils/filter/utils/computeTimezoneDifferenceInMinutes';
import { addMinutes, subMinutes } from 'date-fns';

export const shiftPointInTimeFromTimezoneDifferenceInMinutesWithSystemTimezone =
  (pointInTime: Date, targetTimezone: string, direction: 'add' | 'sub') => {
    const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const timezoneDifferenceInMinutesForStartDateToPreventDST =
      computeTimezoneDifferenceInMinutes(
        targetTimezone,
        systemTimeZone,
        pointInTime,
      );

    if (direction === 'add') {
      return addMinutes(
        pointInTime,
        timezoneDifferenceInMinutesForStartDateToPreventDST,
      );
    } else {
      return subMinutes(
        pointInTime,
        timezoneDifferenceInMinutesForStartDateToPreventDST,
      );
    }
  };
