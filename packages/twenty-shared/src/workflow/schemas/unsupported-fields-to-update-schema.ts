import { z } from 'zod';

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
