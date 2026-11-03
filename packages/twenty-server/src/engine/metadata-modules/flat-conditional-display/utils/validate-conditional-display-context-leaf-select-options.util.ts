import { msg, t } from '@lingui/core/macro';
import {
  type ConditionalDisplayContextKey,
  type ConditionalDisplayVirtualField,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ConditionalDisplayContextLeafRecordFilter } from 'src/engine/metadata-modules/flat-conditional-display/types/conditional-display-context-leaf-record-filter.type';
import { getInvalidSelectFilterOptionValues } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-invalid-select-filter-option-values.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateConditionalDisplayContextLeafSelectOptions = ({
  recordFilter: { operand, value },
  virtualField: { type, options },
  contextKey,
  invalidDataCode,
}: {
  recordFilter: ConditionalDisplayContextLeafRecordFilter;
  virtualField: ConditionalDisplayVirtualField;
  contextKey: ConditionalDisplayContextKey;
  invalidDataCode: string;
}): FlatEntityValidationError[] => {
  if (type !== FieldMetadataType.SELECT || !isDefined(options)) {
    return [];
  }

  const invalidValues = getInvalidSelectFilterOptionValues({
    fieldMetadata: {
      type,
      options: options.map((option) => ({ value: option })),
    },
    operand,
    value: value ?? null,
  });

  if (!isNonEmptyArray(invalidValues)) {
    return [];
  }

  const invalidValuesText = invalidValues.join(', ');
  const allowedValuesText = options.join(', ');

  return [
    {
      code: invalidDataCode,
      message: t`Conditional display context key "${contextKey}" uses option(s) ${invalidValuesText} that do not exist. Allowed values: ${allowedValuesText}.`,
      userFriendlyMessage: msg`Conditional display rule uses an option that does not exist`,
      value,
    },
  ];
};
