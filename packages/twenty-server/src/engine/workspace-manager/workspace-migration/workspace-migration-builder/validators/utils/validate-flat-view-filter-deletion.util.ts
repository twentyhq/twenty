import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

export const validateFlatViewFilterDeletion = ({
  flatEntityToValidate: flatViewFilterToValidate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatViewFilterMaps: optimisticFlatViewFilterMaps,
  },
}: UniversalFlatEntityValidationArgs<
  typeof ALL_METADATA_NAME.viewFilter
>): FailedFlatEntityValidation<'viewFilter', 'delete'> => {
  const validationResult = getEmptyFlatEntityValidationError({
    flatEntityMinimalInformation: {
      universalIdentifier: flatViewFilterToValidate.universalIdentifier,
    },
    metadataName: 'viewFilter',
    type: 'delete',
  });

  const existingViewFilter = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatViewFilterToValidate.universalIdentifier,
    flatEntityMaps: optimisticFlatViewFilterMaps,
  });

  if (!isDefined(existingViewFilter)) {
    validationResult.errors.push({
      code: ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
      message: t`View filter not found`,
      userFriendlyMessage: msg`View filter not found`,
    });

    return validationResult;
  }

  return validationResult;
};
