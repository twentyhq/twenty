import { type z } from 'zod';

import { type aiRunScopeSchema } from '@/ai/schemas/ai-run-scope-schema';

export type AiRunScope = z.infer<typeof aiRunScopeSchema>;

export type AiRunScopeObjectPermission = NonNullable<
  AiRunScope['objectPermissions']
>[number];

export type AiRunScopeFieldPermission = NonNullable<
  AiRunScope['fieldPermissions']
>[number];
