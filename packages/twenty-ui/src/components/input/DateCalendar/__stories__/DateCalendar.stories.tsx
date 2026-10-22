import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator, GroupedCatalog } from '@ui/testing';

import { DateCalendar } from '../DateCalendar';
import { DATE_CALENDAR_WEEKDAY_LABELS } from './dateCalendarWeekdayLabels';
import { type DateCalendarProps } from '../types/DateCalendarProps';
import { DateCalendarExample } from './DateCalendarExample';

const meta: Meta<typeof DateCalendar> = {
  id: 'ui-components-datecalendar',
  title: 'UI/Components/Input/DateCalendar',
  component: DateCalendar,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 312 } },
  args: {
    'aria-label': 'Choose a date',
    value: '2026-10-07',
    viewedMonth: '2026-10',
    today: '2026-10-22',
    weekStart: 1,
    locale: 'en-US',
    weekdayLabels: DATE_CALENDAR_WEEKDAY_LABELS,
    previousMonthLabel: 'Previous month',
    nextMonthLabel: 'Next month',
    monthLabel: 'Month',
    yearLabel: 'Year',
    onValueChange: fn(),
    onViewedMonthChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DateCalendar>;

export const Display: Story = {
  argTypes: {
    value: { control: false },
    viewedMonth: { control: false },
    today: { control: false },
    weekStart: { control: false },
    locale: { control: false },
    weekdayLabels: { control: false },
    previousMonthLabel: { control: false },
    nextMonthLabel: { control: false },
    monthLabel: { control: false },
    yearLabel: { control: false },
    'aria-label': { control: false },
  },
  render: ({ disabled, highlightedRange, readOnly, hideGrid }) => (
    <DateCalendarExample
      disabled={disabled}
      highlightedRange={highlightedRange}
      readOnly={readOnly}
      hideGrid={hideGrid}
    />
  ),
};

const CALENDAR_EXAMPLES: {
  label: string;
  props: Partial<
    Pick<DateCalendarProps, 'value' | 'disabled' | 'isDateUnavailable'>
  >;
}[] = [
  { label: 'Selected date and today', props: {} },
  { label: 'No selection', props: { value: null } },
  {
    label: 'Unavailable date',
    props: { isDateUnavailable: (date) => date === '2026-10-08' },
  },
  { label: 'Disabled', props: { disabled: true } },
];

export const Catalog: Story = {
  parameters: { container: { width: 680 } },
  render: (args) => (
    <GroupedCatalog
      groups={[
        { label: 'Selection and availability', examples: CALENDAR_EXAMPLES },
      ]}
      renderExample={({ label, props }) => (
        <>
          <Text>{label}</Text>
          <DateCalendar
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...args}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...props}
            aria-label={label}
          />
        </>
      )}
    />
  ),
};

export const DisplayDark: Story = {
  ...Display,
  globals: { colorScheme: 'dark' },
};
