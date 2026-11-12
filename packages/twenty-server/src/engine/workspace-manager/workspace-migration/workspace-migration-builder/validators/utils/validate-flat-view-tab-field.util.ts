import { msg, t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatViewTabField = ({
  flatView,
  flatFieldMetadataMaps,
}: {
  flatView: UniversalFlatView;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError[] => {
  if (!isDefined(flatView.tabFieldMetadataUniversalIdentifier)) {
    return [];
  }

  const tabFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatView.tabFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(tabFieldMetadata)) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Tab field metadata not found`,
        userFriendlyMessage: msg`Tab field not found`,
      },
    ];
  }

  const errors: FlatEntityValidationError[] = [];

  if (
    tabFieldMetadata.objectMetadataUniversalIdentifier !==
    flatView.objectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Tab field must belong to the view object`,
      userFriendlyMessage: msg`Tab field must belong to the view object`,
    });
  }

  if (tabFieldMetadata.type !== FieldMetadataType.SELECT) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Tab field must be a SELECT field`,
      userFriendlyMessage: msg`Tab field must be a select field`,
    });
  }

  return errors;
};
