import { type z } from 'zod';

import { type expressionLogicalOperatorSchema } from '@/expression/utils/expressionLogicalOperatorSchema';

export type ExpressionLogicalOperator = z.infer<
  typeof expressionLogicalOperatorSchema
>;
