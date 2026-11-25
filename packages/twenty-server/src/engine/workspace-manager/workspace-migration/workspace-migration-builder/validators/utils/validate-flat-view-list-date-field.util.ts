import { msg, t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatViewListDateField = ({
  flatView,
  flatFieldMetadataMaps,
}: {
  flatView: UniversalFlatView;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError[] => {
  if (!isDefined(flatView.listDateFieldMetadataUniversalIdentifier)) {
    return [];
  }

  const listDateFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatView.listDateFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(listDateFieldMetadata)) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`List date field metadata not found`,
        userFriendlyMessage: msg`List date field not found`,
      },
    ];
  }

  const errors: FlatEntityValidationError[] = [];

  if (
    listDateFieldMetadata.objectMetadataUniversalIdentifier !==
    flatView.objectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`List date field must belong to the view object`,
      userFriendlyMessage: msg`List date field must belong to the view object`,
    });
  }

  const listDateFieldIsDateKind =
    listDateFieldMetadata.type === FieldMetadataType.DATE ||
    listDateFieldMetadata.type === FieldMetadataType.DATE_TIME;

  if (!listDateFieldIsDateKind) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`List date field must be a date or date time field`,
      userFriendlyMessage: msg`List date field must be a date or date time field`,
    });
  }

  return errors;
};
