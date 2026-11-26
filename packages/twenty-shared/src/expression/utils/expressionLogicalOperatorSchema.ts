import { z } from 'zod';

export const expressionLogicalOperatorSchema = z.enum(['AND', 'OR']);
