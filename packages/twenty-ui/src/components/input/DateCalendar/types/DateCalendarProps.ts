import { type useRender } from '@base-ui/react/use-render';

export type DateCalendarProps = Omit<
  useRender.ComponentProps<'div'>,
  'children' | 'onChange' | 'defaultValue'
> & {
  value: string | null;
  onValueChange: (date: string) => void;
  viewedMonth: string;
  onViewedMonthChange: (month: string) => void;
  today?: string;
  weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale: string;
  weekdayLabels?: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  previousMonthLabel: string;
  nextMonthLabel: string;
  monthLabel: string;
  yearLabel: string;
  isDateUnavailable?: (date: string) => boolean;
  disabled?: boolean;
};
