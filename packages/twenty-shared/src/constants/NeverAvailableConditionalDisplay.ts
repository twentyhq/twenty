import { type ConditionalDisplay } from '@/types/conditional-display/ConditionalDisplay';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';

export const NEVER_AVAILABLE_CONDITIONAL_DISPLAY =
  Object.freeze<ConditionalDisplay>({
    recordFilters: [
      {
        id: '726bdff0-7606-565a-8be9-c8df5bcbe2c1',
        contextKey: 'selectedRecords',
        subFieldName: 'id',
        operand: ViewFilterOperand.IS_EMPTY,
      },
    ],
  });
