import { type z } from 'zod';

import { type conditionalAvailabilityNodeSchema } from '@/conditional-availability/utils/conditionalAvailabilityNodeSchema';

export type ConditionalAvailabilityNode = z.infer<
  typeof conditionalAvailabilityNodeSchema
>;
