import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import { DatePickerException } from './DatePickerException';

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
    throw new DatePickerException({
      message: doNotTranslate(
        'Calendar highlighted ranges must end on or after their start date.',
      ),
    });
  }
};
