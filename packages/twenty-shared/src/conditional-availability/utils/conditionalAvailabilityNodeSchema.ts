import { z } from 'zod';

import { CONDITIONAL_AVAILABILITY_FORBIDDEN_PROPERTY_NAMES } from '@/conditional-availability/constants/ConditionalAvailabilityForbiddenPropertyNames';
import { CONDITIONAL_AVAILABILITY_IDENTIFIER_PATTERN } from '@/conditional-availability/constants/ConditionalAvailabilityIdentifierPattern';
import { CONDITIONAL_AVAILABILITY_VARIABLE_PATH_PATTERN } from '@/conditional-availability/constants/ConditionalAvailabilityVariablePathPattern';

export const conditionalAvailabilityNodeSchema = z.discriminatedUnion('type', [
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
              CONDITIONAL_AVAILABILITY_FORBIDDEN_PROPERTY_NAMES.has(segment),
            ),
        { error: 'This property cannot be read' },
      ),
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
    get left() {
      return conditionalAvailabilityNodeSchema;
    },
    get right() {
      return conditionalAvailabilityNodeSchema;
    },
  }),
  z.strictObject({
    type: z.literal('GROUP'),
    logicalOperator: z.enum(['AND', 'OR']),
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
    functionName: z.string().regex(CONDITIONAL_AVAILABILITY_IDENTIFIER_PATTERN),
    get arguments() {
      return z.array(conditionalAvailabilityNodeSchema);
    },
  }),
]);
