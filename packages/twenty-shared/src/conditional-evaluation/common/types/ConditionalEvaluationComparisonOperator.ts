import { type z } from 'zod';

import { type conditionalEvaluationComparisonOperatorSchema } from '@/conditional-evaluation/common/utils/conditionalEvaluationComparisonOperatorSchema';

export type ConditionalEvaluationComparisonOperator = z.infer<
  typeof conditionalEvaluationComparisonOperatorSchema
>;
