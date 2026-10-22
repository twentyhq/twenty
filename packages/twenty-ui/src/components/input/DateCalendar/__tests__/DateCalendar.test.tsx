import { vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { DateCalendar } from '../DateCalendar';
import styles from '../DateCalendar.module.scss';

runComponentConformance({
  name: 'DateCalendar',
  element: (
    <DateCalendar
      value="2026-10-07"
      onValueChange={vi.fn()}
      viewedMonth="2026-10"
      onViewedMonthChange={vi.fn()}
      today="2026-10-22"
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
