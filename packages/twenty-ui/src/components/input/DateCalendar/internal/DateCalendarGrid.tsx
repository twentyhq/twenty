import { type KeyboardEvent, useId } from 'react';

import { VisuallyHidden } from '@ui/primitives/accessibility/components/VisuallyHidden';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../DateCalendar.module.scss';
import { type DateCalendarProps } from '../types/DateCalendarProps';
import { DATE_CALENDAR_CONSTANTS } from './dateCalendarConstants';
import { getDateCalendarWeeks } from './getDateCalendarWeeks';
import { parseDateCalendarDate } from './parseDateCalendarDate';

const REFERENCE_SUNDAY = '2023-01-01';

export const DateCalendarGrid = ({
  value,
  onValueChange,
  viewedMonth,
  today,
  highlightedRange,
  readOnly,
  weekStart,
  locale,
  weekdayLabels,
  isDateUnavailable,
  disabled,
  focusedDate,
  onDayKeyDown,
  onDateFocus,
  registerDateButton,
}: Pick<
  DateCalendarProps,
  | 'value'
  | 'onValueChange'
  | 'viewedMonth'
  | 'today'
  | 'highlightedRange'
  | 'readOnly'
  | 'weekStart'
  | 'locale'
  | 'weekdayLabels'
  | 'isDateUnavailable'
  | 'disabled'
> & {
  focusedDate: string;
  onDayKeyDown: (args: {
    event: KeyboardEvent<HTMLButtonElement>;
    date: string;
  }) => void;
  onDateFocus: (date: string) => void;
  registerDateButton: (args: {
    button: HTMLElement | null;
    date: string;
  }) => void;
}) => {
  const headingId = useId();
  const weeks = getDateCalendarWeeks({ viewedMonth, weekStart });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    calendar: 'gregory',
    timeZone: 'UTC',
  });
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    calendar: 'gregory',
    timeZone: 'UTC',
  });
  const dayFormatter = new Intl.NumberFormat(locale, { useGrouping: false });
  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    calendar: 'gregory',
    timeZone: 'UTC',
  });
  const fullWeekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    calendar: 'gregory',
    timeZone: 'UTC',
  });
  const weekdays = Array.from(
    { length: DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK },
    (_, index) => {
      const date = parseDateCalendarDate(REFERENCE_SUNDAY);
      date.setUTCDate(
        date.getUTCDate() +
          ((weekStart + index) % DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK),
      );
      return {
        label:
          weekdayLabels?.[
            (weekStart + index) % DATE_CALENDAR_CONSTANTS.DAYS_PER_WEEK
          ] ?? weekdayFormatter.format(date),
        fullLabel: fullWeekdayFormatter.format(date),
      };
    },
  );

  return (
    <>
      <VisuallyHidden id={headingId} aria-live="polite" aria-atomic="true">
        {monthFormatter.format(parseDateCalendarDate(`${viewedMonth}-01`))}
      </VisuallyHidden>
      <table
        className={styles.grid}
        role="grid"
        aria-labelledby={headingId}
        aria-readonly={readOnly || undefined}
        aria-multiselectable={isDefined(highlightedRange) || undefined}
      >
        <thead>
          <tr>
            {weekdays.map(({ label, fullLabel }) => (
              <th
                key={fullLabel}
                scope="col"
                abbr={fullLabel}
                className={styles.weekday}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((date, dayIndex) => {
                if (!isDefined(date)) {
                  return <td key={dayIndex} role="gridcell" />;
                }

                const parsedDate = parseDateCalendarDate(date);
                const isOutsideMonth = !date.startsWith(`${viewedMonth}-`);
                const isUnavailable =
                  isOutsideMonth || (isDateUnavailable?.(date) ?? false);
                const isInHighlightedRange =
                  isDefined(highlightedRange) &&
                  date >= highlightedRange.start &&
                  date <= highlightedRange.end;
                const isSelected = value === date || isInHighlightedRange;
                const dateLabel = dateFormatter.format(parsedDate);
                const dayText = dayFormatter.format(parsedDate.getUTCDate());

                return (
                  <td
                    key={date}
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-disabled={isUnavailable || disabled || undefined}
                    aria-label={isOutsideMonth ? dateLabel : undefined}
                    className={styles.cell}
                  >
                    {isOutsideMonth ? (
                      <Text
                        render={<span />}
                        className={styles.outsideDay}
                        aria-hidden
                      >
                        {dayText}
                      </Text>
                    ) : (
                      <Button
                        ref={(button) => registerDateButton({ button, date })}
                        className={styles.day}
                        size="md"
                        variant={isSelected ? 'solid' : 'ghost'}
                        color={isSelected ? 'accent' : 'neutral'}
                        disabled={disabled || isUnavailable}
                        focusableWhenDisabled={!disabled}
                        tabIndex={date === focusedDate ? 0 : -1}
                        aria-label={dateLabel}
                        aria-current={date === today ? 'date' : undefined}
                        onFocus={() => onDateFocus(date)}
                        onKeyDownCapture={(event) =>
                          onDayKeyDown({ event, date })
                        }
                        onClick={() => {
                          if (readOnly) {
                            return;
                          }

                          onValueChange(date);
                        }}
                      >
                        {dayText}
                      </Button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
