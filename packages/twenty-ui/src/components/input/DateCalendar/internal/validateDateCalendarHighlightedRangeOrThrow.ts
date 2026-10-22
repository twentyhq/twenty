import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import { parseDateCalendarDateOrThrow } from './parseDateCalendarDateOrThrow';

export const validateDateCalendarHighlightedRangeOrThrow = ({
  start,
  end,
}: {
  start: string;
  end: string;
}): void => {
  parseDateCalendarDateOrThrow(start);
  parseDateCalendarDateOrThrow(end);

  if (start > end) {
    throw new RangeError(
      doNotTranslate(
        'Calendar highlighted ranges must end on or after their start date.',
      ),
    );
  }
};
