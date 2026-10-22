import { useEffect, type RefObject } from 'react';
import { type default as ReactDatePicker } from 'react-datepicker';

import { parseDateCalendarLocalDateOrThrow } from './parseDateCalendarLocalDateOrThrow';

type DateCalendarViewedMonthEffectProps = {
  calendarRef: RefObject<ReactDatePicker | null>;
  engineViewedMonthRef: RefObject<string>;
  viewedMonth: string;
};

export const DateCalendarViewedMonthEffect = ({
  calendarRef,
  engineViewedMonthRef,
  viewedMonth,
}: DateCalendarViewedMonthEffectProps) => {
  useEffect(() => {
    if (engineViewedMonthRef.current === viewedMonth) {
      return;
    }

    calendarRef.current?.setPreSelection(
      parseDateCalendarLocalDateOrThrow(`${viewedMonth}-01`),
    );
    engineViewedMonthRef.current = viewedMonth;
  }, [calendarRef, engineViewedMonthRef, viewedMonth]);

  return null;
};
