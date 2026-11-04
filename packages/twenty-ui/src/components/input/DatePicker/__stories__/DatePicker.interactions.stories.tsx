import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { ComponentDecorator } from '@ui/testing';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';

import { DatePicker } from '../DatePicker';
import { DATE_PICKER_WEEKDAY_LABELS } from './datePickerWeekdayLabels';
import { DatePickerExample } from './DatePickerExample';
import { DatePickerCssVariableThemeExample } from './DatePickerCssVariableThemeExample';
import { DatePickerExternalMonthExample } from './DatePickerExternalMonthExample';
import { DatePickerNavigationUnmountExample } from './DatePickerNavigationUnmountExample';

const meta: Meta<typeof DatePicker> = {
  id: 'ui-components-datepicker-interactions',
  title: 'UI/Components/Input/DatePicker/Interactions',
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
    onValueSelect: fn(),
    onViewedMonthChange: fn(),
    onNavigationOpenChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

const NEXT_YEAR_OPTION_LABEL = /^2027$/;
const LEAP_YEAR_OPTION_LABEL = /^2024$/;
const NON_LEAP_YEAR_OPTION_LABEL = /^2025$/;

export const DayKeyboardNavigation: Story = {
  render: ({ onValueChange, onValueSelect, onViewedMonthChange }) => (
    <DatePickerExample
      onValueChange={onValueChange}
      onValueSelect={onValueSelect}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selected = await canvas.findByRole('gridcell', {
      name: 'Choose Wednesday, October 7th, 2026',
    });

    await expect(canvas.getAllByRole('columnheader')[0]).toHaveTextContent(
      'Mo',
    );
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    selected.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      canvas.getByRole('gridcell', {
        name: 'Choose Wednesday, October 14th, 2026',
      }),
    ).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-10-14');
    await expect(args.onValueSelect).toHaveBeenLastCalledWith('2026-10-14');
  },
};

export const MonthAndYearControls: Story = {
  render: ({ onValueChange, onViewedMonthChange, onNavigationOpenChange }) => (
    <DatePickerExample
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
      onNavigationOpenChange={onNavigationOpenChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const nextMonth = await canvas.findByRole('button', { name: 'Next month' });

    await userEvent.click(nextMonth);
    await expect(
      canvas.getByRole('combobox', { name: 'Month' }),
    ).toHaveTextContent('November');
    await expect(nextMonth).toHaveFocus();
    await expect(
      canvas.getAllByRole('gridcell').filter((day) => day.tabIndex === 0),
    ).toHaveLength(1);
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2026-11');
    await userEvent.click(canvas.getByRole('combobox', { name: 'Month' }));
    await userEvent.click(
      await body.findByRole('option', { name: 'December' }),
    );
    await expect(
      canvas.getByRole('combobox', { name: 'Month' }),
    ).toHaveTextContent('December');
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2026-12');
    await userEvent.click(canvas.getByRole('combobox', { name: 'Year' }));
    await userEvent.click(
      await body.findByRole('option', { name: NEXT_YEAR_OPTION_LABEL }),
    );
    await expect(
      canvas.getByRole('combobox', { name: 'Year' }),
    ).toHaveTextContent('2027');
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2027-12');
    await waitFor(() =>
      expect(args.onNavigationOpenChange).toHaveBeenLastCalledWith({
        open: false,
        control: 'year',
      }),
    );
    await expect(args.onNavigationOpenChange).toHaveBeenCalledTimes(4);
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const NavigationUnmount: Story = {
  render: ({ onNavigationOpenChange }) => (
    <DatePickerNavigationUnmountExample
      onNavigationOpenChange={onNavigationOpenChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('combobox', { name: 'Month' }),
    );
    await waitFor(() =>
      expect(args.onNavigationOpenChange).toHaveBeenLastCalledWith({
        open: true,
        control: 'month',
      }),
    );
    await userEvent.click(
      await body.findByRole('option', { name: 'November' }),
    );
    await expect(canvas.getByText('Calendar hidden')).toBeVisible();
    await waitFor(() =>
      expect(args.onNavigationOpenChange).toHaveBeenLastCalledWith({
        open: false,
        control: 'month',
      }),
    );
  },
};

export const UnavailableDates: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DatePickerExample
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
      isDateUnavailable={(date) => date === '2026-10-08'}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selected = await canvas.findByRole('gridcell', {
      name: 'Choose Wednesday, October 7th, 2026',
    });
    const unavailable = canvas.getByRole('gridcell', {
      name: 'Not available Thursday, October 8th, 2026',
    });

    await expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(unavailable);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    selected.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      canvas.getByRole('gridcell', {
        name: 'Choose Friday, October 9th, 2026',
      }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-10-09');
  },
};

export const MonthBoundaryAndLeapYear: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DatePickerExample
      initialValue="2024-01-31"
      initialViewedMonth="2024-01"
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    (
      await canvas.findByRole('gridcell', {
        name: 'Choose Wednesday, January 31st, 2024',
      })
    ).focus();
    await userEvent.keyboard('{PageDown}');
    await waitFor(() =>
      expect(
        canvas.getByRole('gridcell', {
          name: 'Choose Thursday, February 29th, 2024',
        }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    await waitFor(() =>
      expect(
        canvas.getByRole('gridcell', {
          name: 'Choose Friday, February 28th, 2025',
        }),
      ).toHaveFocus(),
    );
    await expect(args.onValueChange).not.toHaveBeenCalled();
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Year' }));
    await userEvent.click(
      await body.findByRole('option', { name: LEAP_YEAR_OPTION_LABEL }),
    );
    await userEvent.click(
      canvas.getByRole('gridcell', {
        name: 'Choose Thursday, February 29th, 2024',
      }),
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2024-02-29');
    await userEvent.click(canvas.getByRole('combobox', { name: 'Year' }));
    await userEvent.click(
      await body.findByRole('option', { name: NON_LEAP_YEAR_OPTION_LABEL }),
    );
    await expect(
      canvas.getByRole('combobox', { name: 'Month' }),
    ).toHaveTextContent('February');
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2025-02');
    await expect(
      canvas.getByRole('gridcell', {
        name: 'Choose Friday, February 28th, 2025',
      }),
    ).toHaveAttribute('tabindex', '0');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};

export const ExternalMonthChange: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DatePickerExternalMonthExample
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const externalControl = await canvas.findByRole('button', {
      name: 'Show November',
    });

    await userEvent.click(externalControl);
    await expect(
      await canvas.findByRole('gridcell', {
        name: 'Choose Sunday, November 15th, 2026',
      }),
    ).toBeVisible();
    await expect(externalControl).toHaveFocus();
    await expect(
      canvas.getAllByRole('gridcell').filter((day) => day.tabIndex === 0),
    ).toHaveLength(1);
    await expect(args.onViewedMonthChange).not.toHaveBeenCalled();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const RightToLeft: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <DatePickerExample />
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = await canvas.findByRole('gridcell', {
      name: 'Choose Wednesday, October 7th, 2026',
    });
    const nextDate = canvas.getByRole('gridcell', {
      name: 'Choose Thursday, October 8th, 2026',
    });

    await expect(
      canvas.getByRole('group', { name: 'Choose a date' }),
    ).toHaveAttribute('dir', 'rtl');
    await expect(nextDate.getBoundingClientRect().left).toBeLessThan(
      selected.getBoundingClientRect().left,
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const next = await canvas.findByRole('button', { name: 'Next month' });
    const date = canvas.getByRole('gridcell', {
      name: 'Not available Wednesday, October 7th, 2026',
    });

    await expect(next).toBeDisabled();
    await expect(date).toHaveAttribute('aria-disabled', 'true');
    await expect(
      canvas.getByRole('combobox', { name: 'Month' }),
    ).toBeDisabled();
    await userEvent.click(date);
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const SundayStart: Story = {
  args: { weekStart: 0 },
  play: async ({ canvasElement }) => {
    const headers = await within(canvasElement).findAllByRole('columnheader');
    await expect(headers.map((header) => header.textContent)).toEqual(
      DATE_PICKER_WEEKDAY_LABELS,
    );
  },
};

export const RangeReadOnlyNavigation: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DatePickerExample
      initialValue={null}
      highlightedRange={{ start: '2026-10-07', end: '2026-10-09' }}
      readOnly
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const middleDate = await canvas.findByRole('gridcell', {
      name: 'Choose Thursday, October 8th, 2026',
    });

    await expect(middleDate).toHaveAttribute('aria-selected', 'true');
    await expect(
      canvas.getAllByRole('gridcell', { selected: true }),
    ).toHaveLength(3);
    await expect(middleDate.parentElement?.parentElement).toHaveStyle({
      pointerEvents: 'none',
      opacity: '0.5',
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
    await expect(
      canvas.getByRole('combobox', { name: 'Month' }),
    ).toHaveTextContent('November');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const HeaderOnly: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DatePickerExample
      isGridHidden
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('combobox', { name: 'Month' }),
    ).toBeVisible();
    await expect(canvas.queryByRole('gridcell')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2026-11');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const SameAndAdjacentDates: Story = {
  render: ({ onValueChange, onValueSelect }) => (
    <DatePickerExample
      onValueChange={onValueChange}
      onValueSelect={onValueSelect}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('gridcell', {
        name: 'Choose Wednesday, October 7th, 2026',
      }),
    );
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(args.onValueSelect).toHaveBeenLastCalledWith('2026-10-07');
    await userEvent.click(
      canvas.getByRole('gridcell', {
        name: 'Choose Wednesday, September 30th, 2026',
      }),
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-09-30');
    await expect(args.onValueSelect).toHaveBeenLastCalledWith('2026-09-30');
  },
};

export const SupportedYearBoundaries: Story = {
  args: { value: '0001-01-01', viewedMonth: '0001-01' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const previous = await canvas.findByRole('button', {
      name: 'Previous month',
    });
    await expect(previous).toBeDisabled();
    await userEvent.click(previous);
    await expect(args.onViewedMonthChange).not.toHaveBeenCalled();
  },
};

export const CssVariableSpacing: Story = {
  render: () => <DatePickerCssVariableThemeExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const monthTrigger = await canvas.findByRole('combobox', {
      name: 'Month',
    });

    await userEvent.click(monthTrigger);
    const popup = await body.findByRole('listbox');

    await waitFor(() =>
      expect(
        popup.getBoundingClientRect().top -
          monthTrigger.getBoundingClientRect().bottom,
      ).toBeCloseTo(THEME_COMMON.spacingMultiplicator, 0),
    );
    await userEvent.click(
      within(popup).getByRole('option', { name: 'November' }),
    );
    await expect(monthTrigger).toHaveTextContent('November');
  },
};
