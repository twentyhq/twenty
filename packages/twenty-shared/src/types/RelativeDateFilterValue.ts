export type RelativeDateFilterValue = {
  direction: 'THIS' | 'NEXT' | 'LAST';
  amount?: number;
  unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
};