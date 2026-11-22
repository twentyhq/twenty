import { type z } from 'zod';

import { type conditionalAvailabilityComparisonOperatorSchema } from '@/conditional-availability/utils/conditionalAvailabilityComparisonOperatorSchema';

export type ConditionalAvailabilityComparisonOperator = z.infer<
  typeof conditionalAvailabilityComparisonOperatorSchema
>;
