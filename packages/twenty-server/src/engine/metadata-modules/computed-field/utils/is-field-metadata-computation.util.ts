import { isNonEmptyString, isString, isUndefined } from '@sniptt/guards';
import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { COMPUTED_FIELD_KIND_DESCRIPTIONS } from 'src/engine/metadata-modules/computed-field/constants/computed-field-kind-descriptions.constant';
import { type ComputedFieldKindDescription } from 'src/engine/metadata-modules/computed-field/types/computed-field-kind-description.type';

// The computation comes from an API input or a manifest: nothing about its shape is known yet
export const isFieldMetadataComputation = (
  computation: unknown,
): computation is FieldMetadataComputation => {
  if (!isPlainObject(computation) || !isString(computation.kind)) {
    return false;
  }

  const description: ComputedFieldKindDescription | undefined = Object.entries(
    COMPUTED_FIELD_KIND_DESCRIPTIONS,
  ).find(([kind]) => kind === computation.kind)?.[1];

  if (!isDefined(description)) {
    return false;
  }

  const {
    sourceRelationProperty,
    expressionSlots,
    allowedValuesByProperty = {},
  } = description;

  return (
    (!isDefined(sourceRelationProperty) ||
      isNonEmptyString(computation[sourceRelationProperty])) &&
    expressionSlots.every(
      ({ property, isRequired }) =>
        isString(computation[property]) ||
        (!isRequired && isUndefined(computation[property])),
    ) &&
    Object.entries(allowedValuesByProperty).every(([property, allowedValues]) =>
      allowedValues.some(
        (allowedValue) => allowedValue === computation[property],
      ),
    )
  );
};
