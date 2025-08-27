export type VariableDateViewFilterValueDirection = 'NEXT' | 'THIS' | 'PAST';

export type VariableDateViewFilterValueUnit = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export type VariableDateViewFilterValue = {
  direction: VariableDateViewFilterValueDirection;
  amount?: number;
  unit: VariableDateViewFilterValueUnit;
};

export const DEFAULT_RELATIVE_DATE_VALUE: VariableDateViewFilterValue = {
  direction: 'THIS',
  unit: 'DAY',
  amount: undefined,
};
