import { z } from 'zod';

export const conditionalEvaluationLogicalOperatorSchema = z.enum(['AND', 'OR']);
