import { isRecordObjectSchema } from '@/logic-function/is-record-object-schema';

type RecordArraySchema = {
  type?: string;
  items?: {
    type?: string;
    objectUniversalIdentifier?: string;
  } | null;
};

export const isRecordArraySchema = (
  schema: RecordArraySchema | null | undefined,
): boolean => schema?.type === 'array' && isRecordObjectSchema(schema?.items);
