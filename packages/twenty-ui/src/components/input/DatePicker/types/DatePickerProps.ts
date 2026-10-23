import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type DatePickerHeaderProps } from './DatePickerHeaderProps';

import { type SelectPortalProps } from '@ui/primitives/input/Select/types/SelectPortalProps';

export type DatePickerProps = Omit<
  useRender.ComponentProps<'div'>,
  'children' | 'onChange' | 'defaultValue'
> & {
  value: string | null;
  onValueChange: (date: string) => void;
  onValueSelect?: (date: string) => void;
  viewedMonth: string;
  onViewedMonthChange: (month: string) => void;
  highlightedRange?: { start: string; end: string };
  readOnly?: boolean;
  isGridHidden?: boolean;
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
  portalContainer?: SelectPortalProps['container'];
  onNavigationOpenChange?: (args: {
    open: boolean;
    control: 'month' | 'year';
  }) => void;
  isDateUnavailable?: (date: string) => boolean;
  disabled?: boolean;
  isKeyboardNavigationDisabled?: boolean;
  loadingFallback?: ReactNode;
  renderHeader?: (props: DatePickerHeaderProps) => ReactNode;
};
