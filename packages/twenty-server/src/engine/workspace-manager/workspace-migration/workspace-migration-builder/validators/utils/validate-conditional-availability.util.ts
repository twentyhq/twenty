import { type ConditionalAvailabilityMetadataName } from 'twenty-shared/types';
import { checkConditionalAvailabilityNode } from 'twenty-shared/utils';

import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getConditionalAvailabilityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-conditional-availability-validation-error.util';

export const validateConditionalAvailability = <TCode extends string>({
  conditionalAvailability,
  metadataName,
  code,
}: {
  conditionalAvailability: unknown;
  metadataName: ConditionalAvailabilityMetadataName;
  code: TCode;
}): FlatEntityValidationError<TCode>[] => {
  const checkResult = checkConditionalAvailabilityNode({
    node: conditionalAvailability,
    metadataName,
  });

  return checkResult.isValid
    ? []
    : [
        getConditionalAvailabilityValidationError({
          failure: checkResult,
          code,
        }),
      ];
};
