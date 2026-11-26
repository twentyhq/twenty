import { z } from 'zod';

import { CONDITIONAL_EVALUATION_IDENTIFIER_PATTERN } from '@/conditional-evaluation/validate/constants/ConditionalEvaluationIdentifierPattern';
import { CONDITIONAL_EVALUATION_VARIABLE_PATH_PATTERN } from '@/conditional-evaluation/validate/constants/ConditionalEvaluationVariablePathPattern';
import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';
import { conditionalEvaluationComparisonOperatorSchema } from '@/conditional-evaluation/common/utils/conditionalEvaluationComparisonOperatorSchema';
import { conditionalEvaluationLogicalOperatorSchema } from '@/conditional-evaluation/common/utils/conditionalEvaluationLogicalOperatorSchema';
import { FORBIDDEN_PROPERTY_NAMES } from '@/constants/ForbiddenPropertyNames';

export const conditionalEvaluationNodeSchema: z.ZodType<ConditionalEvaluationNode> =
  z.toZod<ConditionalEvaluationNode>()(
    z.discriminatedUnion('type', [
      z.strictObject({
        type: z.literal('LITERAL'),
        value: z.union([z.string(), z.number(), z.boolean()]),
      }),
      z.strictObject({
        type: z.literal('VARIABLE'),
        path: z
          .string()
          .regex(CONDITIONAL_EVALUATION_VARIABLE_PATH_PATTERN)
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
        operator: conditionalEvaluationComparisonOperatorSchema,
        get left() {
          return conditionalEvaluationNodeSchema;
        },
        get right() {
          return conditionalEvaluationNodeSchema;
        },
      }),
      z.strictObject({
        type: z.literal('GROUP'),
        logicalOperator: conditionalEvaluationLogicalOperatorSchema,
        get children() {
          return z.array(conditionalEvaluationNodeSchema).min(1);
        },
      }),
      z.strictObject({
        type: z.literal('NOT'),
        get child() {
          return conditionalEvaluationNodeSchema;
        },
      }),
      z.strictObject({
        type: z.literal('FUNCTION_CALL'),
        functionName: z
          .string()
          .regex(CONDITIONAL_EVALUATION_IDENTIFIER_PATTERN),
        get arguments() {
          return z.array(conditionalEvaluationNodeSchema);
        },
      }),
    ]),
  );
