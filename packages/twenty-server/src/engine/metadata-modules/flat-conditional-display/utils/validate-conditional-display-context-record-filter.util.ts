import { msg, t } from '@lingui/core/macro';
import { CONDITIONAL_DISPLAY_CONTEXT_KEYS } from 'twenty-shared/constants';
import {
  isConditionalDisplayContextKey,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { type UniversalConditionalDisplayRecordFilter } from 'src/engine/metadata-modules/flat-conditional-display/types/universal-conditional-display-record-filter.type';
import { type ValidateConditionalDisplayContext } from 'src/engine/metadata-modules/flat-conditional-display/types/validate-conditional-display-context.type';
import { getConditionalDisplayPropertyOwner } from 'src/engine/metadata-modules/flat-conditional-display/utils/get-conditional-display-property-owner.util';
import { validateConditionalDisplayContextLeaf } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-conditional-display-context-leaf.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { parseSelectFilterValues } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-invalid-select-filter-option-values.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateConditionalDisplayContextRecordFilter = ({
  recordFilter,
  contextKey,
  property,
  surface,
  invalidDataCode,
  flatRoleMaps,
}: {
  recordFilter: UniversalConditionalDisplayRecordFilter;
  contextKey: string;
} & Pick<
  ValidateConditionalDisplayContext,
  'property' | 'surface' | 'invalidDataCode' | 'flatRoleMaps'
>): FlatEntityValidationError[] => {
  if (!isConditionalDisplayContextKey(contextKey)) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display context key "${contextKey}" is not supported`,
        userFriendlyMessage: msg`Conditional display rule uses an unknown subject`,
        value: contextKey,
      },
    ];
  }

  const contextKeyDefinition = CONDITIONAL_DISPLAY_CONTEXT_KEYS[contextKey];

  if (
    contextKeyDefinition.owner !== getConditionalDisplayPropertyOwner(property)
  ) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display context key "${contextKey}" is not allowed in ${property}`,
        userFriendlyMessage: msg`Conditional display rule uses a subject that is not allowed in this condition`,
        value: contextKey,
      },
    ];
  }

  if (
    contextKeyDefinition.owner === 'engine' &&
    !contextKeyDefinition.surfaces.includes(surface)
  ) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display context key "${contextKey}" is not allowed on ${surface}`,
        userFriendlyMessage: msg`Conditional display rule uses a subject that is not available here`,
        value: contextKey,
      },
    ];
  }

  const leafErrors = validateConditionalDisplayContextLeaf({
    recordFilter,
    contextKey,
    invalidDataCode,
  });

  if (isNonEmptyArray(leafErrors)) {
    return leafErrors;
  }

  if (contextKey !== 'currentRoleId') {
    return [];
  }

  return (parseSelectFilterValues(recordFilter.value ?? null) ?? [])
    .filter(
      (roleUniversalIdentifier) =>
        !isDefined(
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatRoleMaps,
            universalIdentifier: roleUniversalIdentifier,
          }),
        ),
    )
    .map((roleUniversalIdentifier) => ({
      code: invalidDataCode,
      message: t`Role "${roleUniversalIdentifier}" referenced by a conditional display rule does not exist`,
      userFriendlyMessage: msg`Conditional display rule references a role that does not exist`,
      value: roleUniversalIdentifier,
    }));
};
