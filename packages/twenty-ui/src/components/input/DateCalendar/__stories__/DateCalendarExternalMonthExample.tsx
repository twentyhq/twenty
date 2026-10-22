import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { themeCssVariables } from '@ui/theme';

import { DateCalendar } from '../DateCalendar';
import { DATE_CALENDAR_WEEKDAY_LABELS } from './dateCalendarWeekdayLabels';

export const DateCalendarExternalMonthExample = ({
  onValueChange,
  onViewedMonthChange,
}: {
  onValueChange: (date: string) => void;
  onViewedMonthChange: (month: string) => void;
}) => {
  const [viewedMonth, setViewedMonth] = useState('2026-10');

  return (
    <Text
      style={{
        display: 'grid',
        justifyItems: 'start',
        gap: themeCssVariables.spacing[3],
      }}
    >
      <DateCalendar
        aria-label="Choose a date"
        value="2026-10-07"
        onValueChange={onValueChange}
        viewedMonth={viewedMonth}
        onViewedMonthChange={(month) => {
          setViewedMonth(month);
          onViewedMonthChange(month);
        }}
        today="2026-10-22"
        weekStart={1}
        locale="en-US"
        weekdayLabels={DATE_CALENDAR_WEEKDAY_LABELS}
        previousMonthLabel="Previous month"
        nextMonthLabel="Next month"
        monthLabel="Month"
        yearLabel="Year"
      />
      <Button size="sm" onClick={() => setViewedMonth('2026-11')}>
        Show November
      </Button>
    </Text>
  );
};
