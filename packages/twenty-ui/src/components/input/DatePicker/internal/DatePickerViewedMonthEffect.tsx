import { useEffect, type RefObject } from 'react';
import { type default as ReactDatePicker } from 'react-datepicker';

import { parseDatePickerLocalDateOrThrow } from './parseDatePickerLocalDateOrThrow';

type DatePickerViewedMonthEffectProps = {
  calendarRef: RefObject<ReactDatePicker | null>;
  engineViewedMonthRef: RefObject<string>;
  viewedMonth: string;
};

export const DatePickerViewedMonthEffect = ({
  calendarRef,
  engineViewedMonthRef,
  viewedMonth,
}: DatePickerViewedMonthEffectProps) => {
  useEffect(() => {
    if (engineViewedMonthRef.current === viewedMonth) {
      return;
    }

    calendarRef.current?.setPreSelection(
      parseDatePickerLocalDateOrThrow(`${viewedMonth}-01`),
    );
    engineViewedMonthRef.current = viewedMonth;
  }, [calendarRef, engineViewedMonthRef, viewedMonth]);

  return null;
};
