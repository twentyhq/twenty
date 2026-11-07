import { vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { DatePicker } from '../DatePicker';
import styles from '../DatePicker.module.scss';

runComponentConformance({
  name: 'DatePicker',
  element: (
    <DatePicker
      value="2026-10-07"
      onValueChange={vi.fn()}
      viewedMonth="2026-10"
      onViewedMonthChange={vi.fn()}
      weekStart={1}
      locale="en-US"
      previousMonthLabel="Previous month"
      nextMonthLabel="Next month"
      monthLabel="Month"
      yearLabel="Year"
    />
  ),
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.calendar,
});
