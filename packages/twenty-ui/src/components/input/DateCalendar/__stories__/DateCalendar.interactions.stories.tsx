import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { DateCalendar } from '../DateCalendar';
import { DATE_CALENDAR_WEEKDAY_LABELS } from './dateCalendarWeekdayLabels';
import { DateCalendarExample } from './DateCalendarExample';
import { DateCalendarExternalMonthExample } from './DateCalendarExternalMonthExample';

const meta: Meta<typeof DateCalendar> = {
  id: 'ui-components-datecalendar-interactions',
  title: 'UI/Components/Input/DateCalendar/Interactions',
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

const NEXT_YEAR_OPTION_LABEL = /^2027$/;

export const DayKeyboardNavigation: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DateCalendarExample
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByRole('button', {
      name: 'Wednesday, October 7, 2026',
    });
    const today = canvas.getByRole('button', {
      name: 'Thursday, October 22, 2026',
    });
    const selectedCell = selected.closest('td');
    const firstWeekday = canvas.getAllByRole('columnheader')[0];

    await expect(firstWeekday).toHaveTextContent('Mo');
    await expect(firstWeekday).toHaveAttribute('abbr', 'Monday');

    await expect(selectedCell).toHaveAttribute('aria-selected', 'true');
    await expect(today).toHaveAttribute('aria-current', 'date');
    await expect(selected).not.toHaveAttribute('aria-current');
    selected.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      canvas.getByRole('button', { name: 'Wednesday, October 14, 2026' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{Home}');
    await expect(
      canvas.getByRole('button', { name: 'Monday, October 5, 2026' }),
    ).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(
      canvas.getByRole('button', { name: 'Sunday, October 11, 2026' }),
    ).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(selectedCell).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-10-11');
    await userEvent.keyboard('{ArrowLeft} ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-10-10');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await expect(args.onViewedMonthChange).not.toHaveBeenCalled();
  },
};

export const MonthAndYearControls: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DateCalendarExample
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const nextMonth = canvas.getByRole('button', { name: 'Next month' });

    await userEvent.click(nextMonth);
    await expect(
      canvas.getByRole('grid', { name: 'November 2026' }),
    ).toBeVisible();
    await expect(nextMonth).toHaveFocus();
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2026-11');
    await userEvent.click(canvas.getByRole('combobox', { name: 'Month' }));
    await userEvent.click(
      await body.findByRole('option', { name: 'December' }),
    );
    await expect(
      canvas.getByRole('grid', { name: 'December 2026' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('combobox', { name: 'Year' }));
    await userEvent.click(
      await body.findByRole('option', { name: NEXT_YEAR_OPTION_LABEL }),
    );
    await expect(
      canvas.getByRole('grid', { name: 'December 2027' }),
    ).toBeVisible();
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2027-12');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const UnavailableDates: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DateCalendarExample
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
      isDateUnavailable={(date) => date === '2026-10-08'}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByRole('button', {
      name: 'Wednesday, October 7, 2026',
    });
    const unavailable = canvas.getByRole('button', {
      name: 'Thursday, October 8, 2026',
    });

    selected.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(unavailable).toHaveFocus();
    await expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{Enter} ');
    await userEvent.click(unavailable);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-10-09');
  },
};

export const MonthBoundaryAndLeapYear: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DateCalendarExample
      initialValue="2024-01-31"
      initialViewedMonth="2024-01"
      today="2024-01-15"
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    canvas.getByRole('button', { name: 'Wednesday, January 31, 2024' }).focus();
    await userEvent.keyboard('{PageDown}');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Thursday, February 29, 2024' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Friday, February 28, 2025' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Saturday, March 1, 2025' }),
      ).toHaveFocus(),
    );
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2025-03');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const ExternalMonthChange: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DateCalendarExternalMonthExample
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const externalControl = canvas.getByRole('button', {
      name: 'Show November',
    });

    await userEvent.click(externalControl);
    const grid = canvas.getByRole('grid', { name: 'November 2026' });
    await expect(grid).toBeVisible();
    await expect(externalControl).toHaveFocus();
    await expect(
      within(grid)
        .getAllByRole('button')
        .filter((button) => button.tabIndex === 0),
    ).toHaveLength(1);
    await expect(args.onViewedMonthChange).not.toHaveBeenCalled();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const RightToLeft: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DirectionProvider direction="rtl">
      <DateCalendarExample
        onValueChange={onValueChange}
        onViewedMonthChange={onViewedMonthChange}
      />
    </DirectionProvider>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByRole('button', {
      name: 'Wednesday, October 7, 2026',
    });
    const nextDate = canvas.getByRole('button', {
      name: 'Thursday, October 8, 2026',
    });

    await expect(
      canvas.getByRole('group', { name: 'Choose a date' }),
    ).toHaveAttribute('dir', 'rtl');
    selected.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(nextDate).toHaveFocus();
    await expect(nextDate.getBoundingClientRect().left).toBeLessThan(
      selected.getBoundingClientRect().left,
    );
    await userEvent.keyboard('{ArrowRight}');
    await expect(selected).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const previous = canvas.getByRole('button', { name: 'Previous month' });
    const next = canvas.getByRole('button', { name: 'Next month' });
    const date = canvas.getByRole('button', {
      name: 'Wednesday, October 7, 2026',
    });

    await expect(previous).toBeDisabled();
    await expect(next).toBeDisabled();
    await expect(date).toBeDisabled();
    await expect(
      canvas.getByRole('combobox', { name: 'Month' }),
    ).toBeDisabled();
    await expect(canvas.getByRole('combobox', { name: 'Year' })).toBeDisabled();
    await userEvent.click(next);
    await userEvent.click(date);
    await expect(args.onViewedMonthChange).not.toHaveBeenCalled();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const SundayStart: Story = {
  args: { weekStart: 0 },
  play: async ({ canvasElement }) => {
    const headers = within(canvasElement).getAllByRole('columnheader');

    await expect(headers.map((header) => header.textContent)).toEqual(
      DATE_CALENDAR_WEEKDAY_LABELS,
    );
    await expect(headers[0]).toHaveAttribute('abbr', 'Sunday');
    await expect(headers[6]).toHaveAttribute('abbr', 'Saturday');
  },
};

export const RangeReadOnlyNavigation: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DateCalendarExample
      initialValue={null}
      highlightedRange={{ start: '2026-10-07', end: '2026-10-09' }}
      readOnly
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('grid', { name: 'October 2026' });
    const middleDate = canvas.getByRole('button', {
      name: 'Thursday, October 8, 2026',
    });

    await expect(grid).toHaveAttribute('aria-readonly', 'true');
    await expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    await expect(
      within(grid).getAllByRole('gridcell', { selected: true }),
    ).toHaveLength(3);
    await expect(
      canvas
        .getByRole('button', { name: 'Wednesday, October 7, 2026' })
        .closest('td'),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(
      canvas
        .getByRole('button', { name: 'Friday, October 9, 2026' })
        .closest('td'),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(middleDate).toBeEnabled();
    await userEvent.click(middleDate);
    await userEvent.keyboard('{Enter} ');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      canvas.getByRole('button', { name: 'Friday, October 9, 2026' }),
    ).toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Monday, November 9, 2026' }),
      ).toHaveFocus(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
    await expect(
      canvas.getByRole('grid', { name: 'December 2026' }),
    ).toBeVisible();
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2026-12');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const HeaderOnly: Story = {
  render: ({ onValueChange, onViewedMonthChange }) => (
    <DateCalendarExample
      hideGrid
      onValueChange={onValueChange}
      onViewedMonthChange={onViewedMonthChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(canvas.queryByRole('grid')).not.toBeInTheDocument();
    await expect(canvas.getAllByRole('combobox')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2026-11');
    await userEvent.click(canvas.getByRole('combobox', { name: 'Month' }));
    await userEvent.click(
      await body.findByRole('option', { name: 'December' }),
    );
    await userEvent.click(canvas.getByRole('combobox', { name: 'Year' }));
    await userEvent.click(
      await body.findByRole('option', { name: NEXT_YEAR_OPTION_LABEL }),
    );
    await expect(
      canvas.getByRole('combobox', { name: 'Month' }),
    ).toHaveTextContent('December');
    await expect(
      canvas.getByRole('combobox', { name: 'Year' }),
    ).toHaveTextContent('2027');
    await expect(canvas.queryByRole('grid')).not.toBeInTheDocument();
    await expect(args.onViewedMonthChange).toHaveBeenLastCalledWith('2027-12');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
