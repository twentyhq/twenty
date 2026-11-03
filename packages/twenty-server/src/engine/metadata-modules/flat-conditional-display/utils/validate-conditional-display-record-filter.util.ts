import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalConditionalDisplayRecordFilter } from 'src/engine/metadata-modules/flat-conditional-display/types/universal-conditional-display-record-filter.type';
import { type ValidateConditionalDisplayContext } from 'src/engine/metadata-modules/flat-conditional-display/types/validate-conditional-display-context.type';
import { validateConditionalDisplayContextRecordFilter } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-conditional-display-context-record-filter.util';
import { validateConditionalDisplayFieldRecordFilter } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-conditional-display-field-record-filter.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateConditionalDisplayRecordFilter = ({
  recordFilter,
  recordFilterGroupIds,
  context,
}: {
  recordFilter: UniversalConditionalDisplayRecordFilter;
  recordFilterGroupIds: Set<string>;
  context: ValidateConditionalDisplayContext;
}): FlatEntityValidationError[] => {
  const {
    id: recordFilterId,
    fieldMetadataUniversalIdentifier,
    contextKey,
    recordFilterGroupId,
  } = recordFilter;
  const { invalidDataCode } = context;

  if (isDefined(fieldMetadataUniversalIdentifier) === isDefined(contextKey)) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display rule "${recordFilterId}" must reference exactly one of a field or a context key`,
        userFriendlyMessage: msg`Conditional display rule must have exactly one subject`,
        value: recordFilterId,
      },
    ];
  }

  if (
    isDefined(recordFilterGroupId) &&
    !recordFilterGroupIds.has(recordFilterGroupId)
  ) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display rule "${recordFilterId}" references unknown group "${recordFilterGroupId}"`,
        userFriendlyMessage: msg`Conditional display rule references a group that does not exist`,
        value: recordFilterGroupId,
      },
    ];
  }

  if (isDefined(contextKey)) {
    return validateConditionalDisplayContextRecordFilter({
      recordFilter,
      contextKey,
      ...context,
    });
  }

  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    return [];
  }

  return validateConditionalDisplayFieldRecordFilter({
    recordFilter,
    fieldMetadataUniversalIdentifier,
    ...context,
  });
};
