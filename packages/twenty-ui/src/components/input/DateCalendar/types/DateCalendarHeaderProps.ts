export type DateCalendarHeaderProps = {
  viewedMonth: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  previousMonthDisabled: boolean;
  nextMonthDisabled: boolean;
};
