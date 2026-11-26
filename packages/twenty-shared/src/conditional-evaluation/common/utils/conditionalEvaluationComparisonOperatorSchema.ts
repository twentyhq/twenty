import { z } from 'zod';

export const conditionalEvaluationComparisonOperatorSchema = z.enum([
  'EQUAL',
  'NOT_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
]);
