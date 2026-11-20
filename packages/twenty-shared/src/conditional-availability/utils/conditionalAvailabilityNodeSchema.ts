import { z } from 'zod';

import { CONDITIONAL_AVAILABILITY_IDENTIFIER_PATTERN } from '@/conditional-availability/constants/ConditionalAvailabilityIdentifierPattern';
import { CONDITIONAL_AVAILABILITY_VARIABLE_PATH_PATTERN } from '@/conditional-availability/constants/ConditionalAvailabilityVariablePathPattern';
import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';
import { conditionalAvailabilityComparisonOperatorSchema } from '@/conditional-availability/utils/conditionalAvailabilityComparisonOperatorSchema';
import { conditionalAvailabilityLogicalOperatorSchema } from '@/conditional-availability/utils/conditionalAvailabilityLogicalOperatorSchema';
import { FORBIDDEN_PROPERTY_NAMES } from '@/constants/ForbiddenPropertyNames';

export const conditionalAvailabilityNodeSchema: z.ZodType<ConditionalAvailabilityNode> =
  z.toZod<ConditionalAvailabilityNode>()(
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
                .some((segment) => FORBIDDEN_PROPERTY_NAMES.has(segment)),
            { error: 'This property cannot be read' },
          ),
      }),
      z.strictObject({
        type: z.literal('COMPARISON'),
        operator: conditionalAvailabilityComparisonOperatorSchema,
        get left() {
          return conditionalAvailabilityNodeSchema;
        },
        get right() {
          return conditionalAvailabilityNodeSchema;
        },
      }),
      z.strictObject({
        type: z.literal('GROUP'),
        logicalOperator: conditionalAvailabilityLogicalOperatorSchema,
        get children() {
          return z.array(conditionalAvailabilityNodeSchema).min(1);
        },
      }),
      z.strictObject({
        type: z.literal('NOT'),
        get child() {
          return conditionalAvailabilityNodeSchema;
        },
      }),
      z.strictObject({
        type: z.literal('FUNCTION_CALL'),
        functionName: z
          .string()
          .regex(CONDITIONAL_AVAILABILITY_IDENTIFIER_PATTERN),
        get arguments() {
          return z.array(conditionalAvailabilityNodeSchema);
        },
      }),
    ]),
  );
