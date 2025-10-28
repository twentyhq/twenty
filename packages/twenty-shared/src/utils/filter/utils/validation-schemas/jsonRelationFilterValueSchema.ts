import { z } from 'zod';

export const relationFilterValueSchemaObject = z.object({
  isCurrentWorkspaceMemberSelected: z.boolean().optional(),
  selectedRecordIds: z.array(z.string()),
});

export const jsonRelationFilterValueSchema = z
  .string()
  .transform((value, ctx) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      ctx.addIssue({
        code: 'custom',
        message: (error as Error).message,
      });
      return z.NEVER;
    }
  })
  .pipe(relationFilterValueSchemaObject);
