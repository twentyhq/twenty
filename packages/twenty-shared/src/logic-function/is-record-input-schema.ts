import { isNonEmptyString } from '@sniptt/guards';

type RecordSchemaCandidate = {
  type?: string;
  objectUniversalIdentifier?: string;
  items?: {
    type?: string;
    objectUniversalIdentifier?: string;
  } | null;
};

export const isRecordObjectSchema = <TSchema extends RecordSchemaCandidate>(
  schema: TSchema | null | undefined,
): schema is TSchema & { objectUniversalIdentifier: string } =>
  schema?.type === 'object' &&
  isNonEmptyString(schema.objectUniversalIdentifier);

export const isRecordArraySchema = (
  schema: RecordSchemaCandidate | null | undefined,
): boolean => schema?.type === 'array' && isRecordObjectSchema(schema.items);
