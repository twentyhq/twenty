import { z } from 'zod';

import { COMPOSITE_FIELD_SUB_FIELD_NAMES } from '@/constants/CompositeFieldSubFieldNames';
import { CONDITIONAL_AVAILABILITY_PATH_PATTERN } from '@/constants/ConditionalAvailabilityPathPattern';
import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';
import { RecordFilterOperand } from '@/types/RecordFilterOperand';

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
      z.strictObject({
        type: z.literal('SELECTED_RECORDS'),
        quantifier: z.enum(['EVERY', 'SOME', 'NONE']),
        recordFilter: z.strictObject({
          fieldMetadataUniversalIdentifier: z.guid(),
          subFieldName: z.enum(COMPOSITE_FIELD_SUB_FIELD_NAMES).nullable(),
          operand: z.enum(RecordFilterOperand),
          value: z.string(),
        }),
      }),
    ]),
  );
