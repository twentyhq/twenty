import { isNonEmptyString, isString, isUndefined } from '@sniptt/guards';
import { FIELD_METADATA_ROLLUP_OPERATIONS } from 'twenty-shared/constants';
import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

const isOptionalString = (value: unknown): value is string | undefined =>
  isUndefined(value) || isString(value);

// The computation comes from an API input or a manifest: nothing about its shape is known yet
export const isFieldMetadataComputation = (
  computation: unknown,
): computation is FieldMetadataComputation => {
  if (!isPlainObject(computation)) {
    return false;
  }

  switch (computation.kind) {
    case 'FORMULA':
      return isString(computation.expression);
    case 'ROLLUP':
      return (
        isNonEmptyString(computation.relationFieldName) &&
        (FIELD_METADATA_ROLLUP_OPERATIONS as readonly unknown[]).includes(
          computation.operation,
        ) &&
        isOptionalString(computation.expression) &&
        isOptionalString(computation.filter)
      );
    default:
      return false;
  }
};
