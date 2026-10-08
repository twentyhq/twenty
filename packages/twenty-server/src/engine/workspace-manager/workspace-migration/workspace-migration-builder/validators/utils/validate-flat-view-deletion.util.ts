import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

export const validateFlatViewDeletion = ({
  flatEntityToValidate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatViewMaps: optimisticFlatViewMaps,
    flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
  },
}: UniversalFlatEntityValidationArgs<
  typeof ALL_METADATA_NAME.view
>): FailedFlatEntityValidation<'view', 'delete'> => {
  const validationResult = getEmptyFlatEntityValidationError({
    flatEntityMinimalInformation: {
      universalIdentifier: flatEntityToValidate.universalIdentifier,
    },
    metadataName: 'view',
    type: 'delete',
  });

  const existingFlatView = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatEntityToValidate.universalIdentifier,
    flatEntityMaps: optimisticFlatViewMaps,
  });

  if (!isDefined(existingFlatView)) {
    validationResult.errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View not found`,
      userFriendlyMessage: msg`View not found`,
    });

    return validationResult;
  }

  const parentObjectStillExists = isDefined(
    findFlatEntityByUniversalIdentifier({
      universalIdentifier: existingFlatView.objectMetadataUniversalIdentifier,
      flatEntityMaps: optimisticFlatObjectMetadataMaps,
    }),
  );

  if (parentObjectStillExists) {
    const viewsForSameObject = Object.values(
      optimisticFlatViewMaps.byUniversalIdentifier,
    ).filter(
      (view) =>
        isDefined(view) &&
        view.objectMetadataUniversalIdentifier ===
          existingFlatView.objectMetadataUniversalIdentifier,
    );

    if (viewsForSameObject.length <= 1) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Cannot delete the only view for this object`,
        userFriendlyMessage: msg`Cannot delete the only view for this object`,
      });
    }
  }

  return validationResult;
};
