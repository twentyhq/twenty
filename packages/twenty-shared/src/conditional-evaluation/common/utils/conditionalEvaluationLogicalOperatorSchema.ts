import { z } from 'zod';

export const conditionalAvailabilityLogicalOperatorSchema = z.enum([
  'AND',
  'OR',
]);
