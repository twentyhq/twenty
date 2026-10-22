import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import styles from './DatePicker.stories.module.scss';

import { DatePicker } from '../DatePicker';
import { DATE_PICKER_WEEKDAY_LABELS } from './datePickerWeekdayLabels';

export const DatePickerExternalMonthExample = ({
  onValueChange,
  onViewedMonthChange,
}: {
  onValueChange: (date: string) => void;
  onViewedMonthChange: (month: string) => void;
}) => {
  const [viewedMonth, setViewedMonth] = useState('2026-10');

  return (
    <div className={styles.externalExample}>
      <DatePicker
        aria-label="Choose a date"
        value="2026-10-07"
        onValueChange={onValueChange}
        viewedMonth={viewedMonth}
        onViewedMonthChange={(month) => {
          setViewedMonth(month);
          onViewedMonthChange(month);
        }}
        weekStart={1}
        locale="en-US"
        weekdayLabels={DATE_PICKER_WEEKDAY_LABELS}
        previousMonthLabel="Previous month"
        nextMonthLabel="Next month"
        monthLabel="Month"
        yearLabel="Year"
      />
      <Button size="sm" onClick={() => setViewedMonth('2026-11')}>
        Show November
      </Button>
    </div>
  );
};
