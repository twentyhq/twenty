import { z } from 'zod';

import { CONDITIONAL_AVAILABILITY_FORBIDDEN_PROPERTY_NAMES } from '@/conditional-availability/constants/ConditionalAvailabilityForbiddenPropertyNames';
import { CONDITIONAL_AVAILABILITY_IDENTIFIER_PATTERN } from '@/conditional-availability/constants/ConditionalAvailabilityIdentifierPattern';
import { CONDITIONAL_AVAILABILITY_VARIABLE_PATH_PATTERN } from '@/conditional-availability/constants/ConditionalAvailabilityVariablePathPattern';
import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';
import { conditionalAvailabilityComparisonOperatorSchema } from '@/conditional-availability/utils/conditionalAvailabilityComparisonOperatorSchema';
import { conditionalAvailabilityLogicalOperatorSchema } from '@/conditional-availability/utils/conditionalAvailabilityLogicalOperatorSchema';

export const conditionalAvailabilityNodeSchema: z.ZodType<ConditionalAvailabilityNode> =
  z.lazy(() =>
    z.discriminatedUnion('type', [
      z.strictObject({
        type: z.literal('LITERAL'),
        value: z.union([z.string(), z.number(), z.boolean()]),
      }),
      z.strictObject({
        type: z.literal('VARIABLE'),
        path: z
          .string()
          .regex(CONDITIONAL_AVAILABILITY_VARIABLE_PATH_PATTERN)
          .refine(
            (path) =>
              !path
                .split('.')
                .some((segment) =>
                  CONDITIONAL_AVAILABILITY_FORBIDDEN_PROPERTY_NAMES.has(
                    segment,
                  ),
                ),
            { error: 'This property cannot be read' },
          ),
      }),
      z.strictObject({
        type: z.literal('COMPARISON'),
        operator: conditionalAvailabilityComparisonOperatorSchema,
        left: conditionalAvailabilityNodeSchema,
        right: conditionalAvailabilityNodeSchema,
      }),
      z.strictObject({
        type: z.literal('GROUP'),
        logicalOperator: conditionalAvailabilityLogicalOperatorSchema,
        children: z.array(conditionalAvailabilityNodeSchema).min(1),
      }),
      z.strictObject({
        type: z.literal('NOT'),
        child: conditionalAvailabilityNodeSchema,
      }),
      z.strictObject({
        type: z.literal('FUNCTION_CALL'),
        functionName: z
          .string()
          .regex(CONDITIONAL_AVAILABILITY_IDENTIFIER_PATTERN),
        arguments: z.array(conditionalAvailabilityNodeSchema),
      }),
    ]),
  );
