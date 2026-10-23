import { type DatePickerProps } from '../src/components/input/DatePicker/types/DatePickerProps';

export const DATE_PICKER_PROP_DESCRIPTIONS = {
  value:
    'Controlled selected Gregorian date in YYYY-MM-DD form, or null for no selection.',
  onValueChange:
    'Called when choosing an available day changes the selected date. Month and year browsing does not select another date.',
  onValueSelect:
    'Called with the selected YYYY-MM-DD date after choosing an available day, including the already-selected day. Use it to commit or close a product picker.',
  viewedMonth:
    'Controlled Gregorian month in YYYY-MM form. It is independent from the selected date.',
  onViewedMonthChange:
    'Requests the month shown by calendar navigation without changing the selected date.',
  weekStart: 'First weekday column: 0 for Sunday through 6 for Saturday.',
  weekdayLabels:
    'Optional short weekday labels in Sunday-first order. The calendar engine supplies weekday names when omitted.',
  locale:
    'Locale for the default month/year header and custom weekday titles. Engine day labels retain their existing locale behavior; values remain Gregorian date-only strings.',
  previousMonthLabel: 'Accessible name of the default previous-month button.',
  nextMonthLabel: 'Accessible name of the default next-month button.',
  monthLabel: 'Accessible name of the default month selector.',
  yearLabel: 'Accessible name of the default year selector.',
  isDateUnavailable:
    'Returns whether a canonical YYYY-MM-DD date cannot be selected. The calendar engine handles unavailable-date presentation and navigation.',
  highlightedRange:
    'Inclusive YYYY-MM-DD start and end dates to highlight. The application computes the range independently from the selected date.',
  readOnly:
    'Prevents date selection while allowing month and year browsing and displaying the selected date or highlighted range.',
  isGridHidden:
    'Hides weekday and date rows while retaining the header for a month-only navigator.',
  isKeyboardNavigationDisabled:
    'Disables keyboard date navigation in the calendar engine for compatibility with existing input wrappers. Header controls retain their native keyboard behavior.',
  loadingFallback:
    'Custom Suspense fallback while the calendar engine loads. Defaults to a 300px-high Skeleton.',
  renderHeader:
    'Renders a product header with the viewed month, previous/next actions, month numbers from 1 through 12, year change actions, and navigation-disabled states. Header actions only browse months.',
  portalContainer:
    'Mount container for the default month and year selector popups. Accepts the shared Select portal container contract.',
  onNavigationOpenChange:
    'Reports { open, control } when a default month or year popup starts opening, and when it finishes closing or its selector unmounts. Header arrow actions do not call this callback.',
  disabled: 'Disables date selection and the default header controls.',
  render: 'Composes the root element while preserving its props and contents.',
  ref: 'Ref to the root element.',
  className: 'CSS class applied to the root element.',
  style: 'Inline styles applied to the root element.',
  role: 'Root semantics. Defaults to a group; the caller supplies its accessible name.',
  'aria-label': 'Accessible name of the calendar group.',
  'aria-labelledby': 'ID of the element that labels the calendar group.',
} satisfies Partial<Record<keyof DatePickerProps, string>>;
