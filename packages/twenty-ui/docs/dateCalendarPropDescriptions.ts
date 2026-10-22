import { type DateCalendarProps } from '../src/components/input/DateCalendar/types/DateCalendarProps';

export const DATE_CALENDAR_PROP_DESCRIPTIONS = {
  value:
    'Controlled selected Gregorian date in YYYY-MM-DD form, or null for no selection.',
  onValueChange:
    'Requests an available date after a click, Enter, or Space. Navigation and prop changes do not select a date.',
  viewedMonth:
    'Controlled Gregorian month in YYYY-MM form. It is independent from the selected date.',
  onViewedMonthChange:
    'Requests the month shown by the header controls or keyboard navigation across a month boundary. Does not change the selected date.',
  today:
    'Caller-supplied YYYY-MM-DD date marked as today with aria-current. Resolve the product timezone before passing this value.',
  weekStart: 'First weekday column: 0 for Sunday through 6 for Saturday.',
  weekdayLabels:
    'Optional short weekday labels in Sunday-first order. Defaults to locale-formatted short labels. Accessible weekday names always use full locale-formatted names.',
  locale:
    'Locale used for month names, weekday labels, full date labels, and number formatting. Date arithmetic remains Gregorian and formatting uses UTC.',
  previousMonthLabel: 'Accessible name of the previous-month button.',
  nextMonthLabel: 'Accessible name of the next-month button.',
  monthLabel: 'Accessible name of the month selector.',
  yearLabel: 'Accessible name of the year selector.',
  isDateUnavailable:
    'Returns whether a canonical YYYY-MM-DD date cannot be selected. Unavailable dates remain discoverable with arrow keys.',
  disabled: 'Disables date selection and all header controls.',
  render: 'Composes the root element while preserving its props and contents.',
  ref: 'Ref to the root element.',
  className: 'CSS class applied to the root element.',
  style: 'Inline styles applied to the root element.',
  role: 'Root semantics. Defaults to a group; the caller supplies its accessible name.',
  'aria-label': 'Accessible name of the calendar group.',
  'aria-labelledby': 'ID of the element that labels the calendar group.',
} satisfies Partial<Record<keyof DateCalendarProps, string>>;
