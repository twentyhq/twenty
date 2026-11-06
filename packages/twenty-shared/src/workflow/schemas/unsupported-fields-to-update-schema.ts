import { z } from 'zod';

// Accepts the [] builders stored before 2.57; refuse the key outright in 2.59 (twentyhq/core-team-issues#3180)
export const unsupportedFieldsToUpdateSchema = z
  .array(z.string())
  .max(
    0,
    'remove fieldsToUpdate: only UPDATE_RECORD selects the fields to write; CREATE_RECORD and UPSERT_RECORD write every field in objectRecord',
  )
  .optional()
  .describe(
    'Leave unset: this step writes every field in objectRecord. Only UPDATE_RECORD selects the fields to write.',
  );
