import { type z } from 'zod';

import { type expressionComparisonOperatorSchema } from '@/expression/utils/expressionComparisonOperatorSchema';

export type ExpressionComparisonOperator = z.infer<
  typeof expressionComparisonOperatorSchema
>;
