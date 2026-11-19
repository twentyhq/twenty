import { z } from 'zod';

import { CONDITIONAL_AVAILABILITY_PATH_PATTERN } from '@/constants/ConditionalAvailabilityPathPattern';
import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';

export const conditionalAvailabilityNodeSchema: z.ZodType<ConditionalAvailabilityNode> =
  z.lazy(() =>
    z.discriminatedUnion('type', [
      z.strictObject({
        type: z.literal('LITERAL'),
        value: z.union([z.string(), z.number(), z.boolean()]),
      }),
      z.strictObject({
        type: z.literal('PATH'),
        path: z.string().regex(CONDITIONAL_AVAILABILITY_PATH_PATTERN),
      }),
      z.strictObject({
        type: z.literal('COMPARISON'),
        operator: z.enum([
          'EQUAL',
          'NOT_EQUAL',
          'LESS_THAN',
          'LESS_THAN_OR_EQUAL',
          'GREATER_THAN',
          'GREATER_THAN_OR_EQUAL',
        ]),
        left: conditionalAvailabilityNodeSchema,
        right: conditionalAvailabilityNodeSchema,
      }),
      z.strictObject({
        type: z.literal('GROUP'),
        logicalOperator: z.enum(['AND', 'OR']),
        children: z.array(conditionalAvailabilityNodeSchema).min(1),
      }),
      z.strictObject({
        type: z.literal('NOT'),
        child: conditionalAvailabilityNodeSchema,
      }),
      z.strictObject({
        type: z.literal('CALL'),
        functionName: z.string().regex(CONDITIONAL_AVAILABILITY_PATH_PATTERN),
        arguments: z.array(conditionalAvailabilityNodeSchema),
      }),
    ]),
  );
