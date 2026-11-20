import { type z } from 'zod';

import { type conditionalAvailabilityLogicalOperatorSchema } from '@/conditional-availability/utils/conditionalAvailabilityLogicalOperatorSchema';

export type ConditionalAvailabilityLogicalOperator = z.infer<
  typeof conditionalAvailabilityLogicalOperatorSchema
>;
