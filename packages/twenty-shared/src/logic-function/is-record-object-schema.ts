import { isNonEmptyString } from '@sniptt/guards';

type RecordObjectSchema = {
  type?: string;
  objectUniversalIdentifier?: string;
};

export const isRecordObjectSchema = <TSchema extends RecordObjectSchema>(
  schema: TSchema | null | undefined,
): schema is TSchema & { objectUniversalIdentifier: string } =>
  (schema?.type === 'record' || schema?.type === 'object') &&
  isNonEmptyString(schema.objectUniversalIdentifier);
