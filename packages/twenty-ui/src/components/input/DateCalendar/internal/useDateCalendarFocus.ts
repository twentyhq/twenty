import { type KeyboardEvent, useRef, useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DateCalendarProps } from '../types/DateCalendarProps';
import { DATE_CALENDAR_KEYS } from './dateCalendarKeys';
import { getDateCalendarKeyboardTarget } from './getDateCalendarKeyboardTarget';

const NAVIGATION_KEYS = new Set<string>(Object.values(DATE_CALENDAR_KEYS));

export const useDateCalendarFocus = ({
  value,
  viewedMonth,
  onViewedMonthChange,
  today,
  weekStart,
  direction,
  disabled,
}: Pick<
  DateCalendarProps,
  | 'value'
  | 'viewedMonth'
  | 'onViewedMonthChange'
  | 'today'
  | 'weekStart'
  | 'disabled'
> & {
  direction: 'ltr' | 'rtl';
}) => {
  const [lastFocusedDate, setLastFocusedDate] = useState<string | null>(null);
  const requestedFocusRef = useRef<{
    date: string;
    origin: HTMLButtonElement;
  } | null>(null);
  const focusCandidates = [lastFocusedDate, value, today];
  const focusedDate =
    focusCandidates.find(
      (date) => isDefined(date) && date.startsWith(`${viewedMonth}-`),
    ) ?? `${viewedMonth}-01`;

  const handleViewedMonthChange = (month: string) => {
    requestedFocusRef.current = null;
    onViewedMonthChange(month);
  };

  const handleDateFocus = (date: string) => {
    requestedFocusRef.current = null;
    setLastFocusedDate(date);
  };

  const handleDayKeyDown = ({
    event,
    date,
  }: {
    event: KeyboardEvent<HTMLButtonElement>;
    date: string;
  }) => {
    if (
      disabled ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !NAVIGATION_KEYS.has(event.key)
    ) {
      return;
    }

    event.preventDefault();

    const targetDate = getDateCalendarKeyboardTarget({
      date,
      key: event.key,
      shiftKey: event.shiftKey,
      weekStart,
      direction,
    });

    if (!isDefined(targetDate) || targetDate === date) {
      return;
    }

    requestedFocusRef.current = {
      date: targetDate,
      origin: event.currentTarget,
    };
    setLastFocusedDate(targetDate);

    const targetMonth = targetDate.slice(0, 7);

    if (targetMonth !== viewedMonth) {
      onViewedMonthChange(targetMonth);
    }
  };

  const registerDateButton = ({
    button,
    date,
  }: {
    button: HTMLElement | null;
    date: string;
  }) => {
    const request = requestedFocusRef.current;

    if (!isDefined(button) || request?.date !== date) {
      return;
    }

    requestedFocusRef.current = null;

    const activeElement = button.ownerDocument.activeElement;
    const hasRetainedFocus =
      activeElement === request.origin ||
      (!request.origin.isConnected &&
        activeElement === button.ownerDocument.body);

    if (hasRetainedFocus) {
      button.focus();
    }
  };

  return {
    focusedDate,
    handleDayKeyDown,
    handleViewedMonthChange,
    handleDateFocus,
    registerDateButton,
  };
};
