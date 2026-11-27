import { z } from 'zod';

import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { expressionComparisonOperatorSchema } from '@/expression/utils/expressionComparisonOperatorSchema';
import { expressionLogicalOperatorSchema } from '@/expression/utils/expressionLogicalOperatorSchema';

export const expressionNodeSchema: z.ZodType<ExpressionNode> =
  z.toZod<ExpressionNode>()(
    z.discriminatedUnion('type', [
      z.strictObject({
        type: z.literal('LITERAL'),
        value: z.union([z.string(), z.number(), z.boolean()]),
      }),
      z.strictObject({
        type: z.literal('VARIABLE'),
        path: z.string().min(1),
      }),
      z.strictObject({
        type: z.literal('FIELD'),
        fieldUniversalIdentifier: z.string().min(1),
        relationFieldUniversalIdentifier: z.string().min(1).optional(),
        subFieldName: z.string().min(1).optional(),
        isPreviousValue: z.boolean().optional(),
      }),
      z.strictObject({
        type: z.literal('COMPARISON'),
        operator: expressionComparisonOperatorSchema,
        get left() {
          return expressionNodeSchema;
        },
        get right() {
          return expressionNodeSchema;
        },
      }),
      z.strictObject({
        type: z.literal('GROUP'),
        logicalOperator: expressionLogicalOperatorSchema,
        get children() {
          return z.array(expressionNodeSchema).min(1);
        },
      }),
      z.strictObject({
        type: z.literal('NOT'),
        get child() {
          return expressionNodeSchema;
        },
      }),
      z.strictObject({
        type: z.literal('FUNCTION_CALL'),
        functionName: z.string().min(1),
        get arguments() {
          return z.array(expressionNodeSchema);
        },
      }),
      z.strictObject({
        type: z.literal('ARITHMETIC'),
        operator: z.enum([
          'ADD',
          'SUBTRACT',
          'MULTIPLY',
          'DIVIDE',
          'REMAINDER',
        ]),
        get left() {
          return expressionNodeSchema;
        },
        get right() {
          return expressionNodeSchema;
        },
      }),
      z.strictObject({
        type: z.literal('CONCATENATION'),
        get left() {
          return expressionNodeSchema;
        },
        get right() {
          return expressionNodeSchema;
        },
      }),
      z.strictObject({
        type: z.literal('UNARY'),
        operator: z.enum(['NEGATE', 'PLUS']),
        get operand() {
          return expressionNodeSchema;
        },
      }),
      z.strictObject({
        type: z.literal('LIST'),
        get items() {
          return z.array(expressionNodeSchema);
        },
      }),
      z.strictObject({
        type: z.literal('IN'),
        get value() {
          return expressionNodeSchema;
        },
        get list() {
          return expressionNodeSchema;
        },
      }),
      z.strictObject({
        type: z.literal('MEMBER'),
        property: z.string().min(1),
        get object() {
          return expressionNodeSchema;
        },
      }),
    ]),
  );
