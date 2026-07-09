import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type AnyFailedValidation = FailedFlatEntityValidation<
  AllMetadataName,
  WorkspaceMigrationActionType
>;

const getFailedValidationSortKey = (
  failedValidation: AnyFailedValidation,
): string => {
  const { flatEntityMinimalInformation } = failedValidation;

  if (
    'name' in flatEntityMinimalInformation &&
    typeof flatEntityMinimalInformation.name === 'string'
  ) {
    return flatEntityMinimalInformation.name;
  }

  return '';
};

// The migration builder emits failed validations in an order derived from
// entity maps keyed by freshly generated universal identifiers, so the same
// mutation can report failures in a different order per environment. Sorting
// by entity name keeps error payloads stable across runs and machines.
export const sortFailedFlatEntityValidations = (
  failedValidations: readonly AnyFailedValidation[],
): AnyFailedValidation[] =>
  [...failedValidations].sort((first, second) => {
    const firstKey = getFailedValidationSortKey(first);
    const secondKey = getFailedValidationSortKey(second);

    if (firstKey === secondKey) {
      return 0;
    }

    return firstKey < secondKey ? -1 : 1;
  });
