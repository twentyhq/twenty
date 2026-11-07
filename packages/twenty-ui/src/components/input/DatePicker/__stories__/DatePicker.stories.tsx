import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator, GroupedCatalog } from '@ui/testing';

import { DatePicker } from '../DatePicker';
import { DATE_PICKER_WEEKDAY_LABELS } from './datePickerWeekdayLabels';
import { type DatePickerProps } from '../types/DatePickerProps';
import { DatePickerExample } from './DatePickerExample';

const meta: Meta<typeof DatePicker> = {
  id: 'ui-components-datepicker',
  title: 'UI/Components/Input/DatePicker',
  component: DatePicker,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 312 } },
  args: {
    'aria-label': 'Choose a date',
    value: '2026-10-07',
    viewedMonth: '2026-10',
    weekStart: 1,
    locale: 'en-US',
    weekdayLabels: DATE_PICKER_WEEKDAY_LABELS,
    previousMonthLabel: 'Previous month',
    nextMonthLabel: 'Next month',
    monthLabel: 'Month',
    yearLabel: 'Year',
    onValueChange: fn(),
    onViewedMonthChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Display: Story = {
  argTypes: {
    value: { control: false },
    viewedMonth: { control: false },
    weekStart: { control: false },
    locale: { control: false },
    weekdayLabels: { control: false },
    previousMonthLabel: { control: false },
    nextMonthLabel: { control: false },
    monthLabel: { control: false },
    yearLabel: { control: false },
    'aria-label': { control: false },
  },
  render: ({ disabled, highlightedRange, readOnly, isGridHidden }) => (
    <DatePickerExample
      disabled={disabled}
      highlightedRange={highlightedRange}
      readOnly={readOnly}
      isGridHidden={isGridHidden}
    />
  ),
};

const CALENDAR_EXAMPLES: {
  label: string;
  props: Partial<
    Pick<DatePickerProps, 'value' | 'disabled' | 'isDateUnavailable'>
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
          <DatePicker
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
