import { isNonEmptyString } from '@sniptt/guards';

import { doNotTranslate } from '@/i18n/do-not-translate';
import { CustomError } from '@/utils/errors/CustomError';
import { type RelativeDateFilter } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import { isDefined } from '@/utils/validation/isDefined';

export const stringifyRelativeDateFilter = ({
  direction,
  amount,
  unit,
  timezone,
  firstDayOfTheWeek,
}: RelativeDateFilter): string => {
  if (direction !== 'THIS' && (!isDefined(amount) || amount <= 0)) {
    throw new CustomError(
      doNotTranslate(
        'Amount must be defined and greater than 0 for relative date filters',
      ),
      'INVALID_RELATIVE_DATE_FILTER_AMOUNT',
    );
  }

  const period = `${direction}_${direction === 'THIS' ? 1 : amount}_${unit}`;

  if (!isNonEmptyString(timezone)) {
    return period;
  }

  return isNonEmptyString(firstDayOfTheWeek)
    ? `${period};;${timezone};;${firstDayOfTheWeek};;`
    : `${period};;${timezone};;`;
};
