import { isDefined } from '@/utils';
import { type BaseOutputSchemaV2 } from '@/workflow/workflow-schema/types/base-output-schema.type';
import { isBoolean, isObject } from 'class-validator';

export const isBaseOutputSchemaV2 = (
  value: unknown,
): value is BaseOutputSchemaV2 => {
  if (!isDefined(value) || !isObject(value) || Array.isArray(value)) {
    return false;
  }

  const entries = Object.values(value as Record<string, unknown>);

  if (entries.length === 0) {
    return false;
  }

  return entries.every(
    (entry) =>
      isDefined(entry) &&
      isObject(entry) &&
      isBoolean((entry as Record<string, unknown>)['isLeaf']),
  );
};
