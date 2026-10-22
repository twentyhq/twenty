import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import { parseDateCalendarDate } from './parseDateCalendarDate';

export const validateDateCalendarHighlightedRange = ({
  start,
  end,
}: {
  start: string;
  end: string;
}): void => {
  parseDateCalendarDate(start);
  parseDateCalendarDate(end);

  if (start > end) {
    throw new RangeError(
      doNotTranslate(
        'Calendar highlighted ranges must end on or after their start date.',
      ),
    );
  }
};
