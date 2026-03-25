import { isValidUuid, isValidVariable } from '@/utils';
import { z } from 'zod';

export const arrayOfUuidOrVariableSchema = z
  .preprocess(
    (value) => {
      try {
        if (typeof value === 'string') {
          if (isValidVariable(value) as boolean) {
            return [value];
          }
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [value];
          }
        }
        return Array.isArray(value) ? value : [value];
      } catch {
        return [];
      }
    },
    z.array(
      z.string().refine((val) => {
        return isValidUuid(val) || isValidVariable(val);
      }, 'Must be a valid UUID or a variable with {{ }} syntax'),
    ),
  )
  .catch([]);
