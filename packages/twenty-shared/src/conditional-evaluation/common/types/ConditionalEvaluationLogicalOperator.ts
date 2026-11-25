import { type z } from 'zod';

import { type conditionalEvaluationLogicalOperatorSchema } from '@/conditional-evaluation/common/utils/conditionalEvaluationLogicalOperatorSchema';

export type ConditionalEvaluationLogicalOperator = z.infer<
  typeof conditionalEvaluationLogicalOperatorSchema
>;
