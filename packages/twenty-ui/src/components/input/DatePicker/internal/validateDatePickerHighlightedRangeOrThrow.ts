import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import { parseDatePickerDateOrThrow } from './parseDatePickerDateOrThrow';

export const validateDatePickerHighlightedRangeOrThrow = ({
  start,
  end,
}: {
  start: string;
  end: string;
}): void => {
  parseDatePickerDateOrThrow(start);
  parseDatePickerDateOrThrow(end);

  if (start > end) {
    throw new RangeError(
      doNotTranslate(
        'Calendar highlighted ranges must end on or after their start date.',
      ),
    );
  }
};
