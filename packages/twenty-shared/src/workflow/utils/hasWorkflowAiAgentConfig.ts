import { isNonEmptyString, isString } from '@sniptt/guards';
import { type z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';

// blank strings are what the builder stores when unset
export const hasWorkflowAiAgentConfig = <TShape extends z.ZodRawShape>(
  configSchema: z.ZodObject<TShape>,
  input: Partial<Record<keyof TShape, unknown>>,
): boolean =>
  configSchema.keyof().options.some((key) => {
    const value = input[key];

    return isString(value) ? isNonEmptyString(value.trim()) : isDefined(value);
  });
