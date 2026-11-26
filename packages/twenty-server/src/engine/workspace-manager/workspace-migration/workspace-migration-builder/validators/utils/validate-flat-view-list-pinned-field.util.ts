import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatViewListPinnedField = ({
  flatView,
  flatFieldMetadataMaps,
}: {
  flatView: Pick<
    UniversalFlatView,
    | 'listPinnedFieldMetadataUniversalIdentifier'
    | 'objectMetadataUniversalIdentifier'
  >;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError[] => {
  if (!isDefined(flatView.listPinnedFieldMetadataUniversalIdentifier)) {
    return [];
  }

  const listPinnedFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatView.listPinnedFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(listPinnedFieldMetadata)) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`List pinned field metadata not found`,
        userFriendlyMessage: msg`List pinned field not found`,
      },
    ];
  }

  if (
    listPinnedFieldMetadata.objectMetadataUniversalIdentifier !==
    flatView.objectMetadataUniversalIdentifier
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`List pinned field must belong to the view object`,
        userFriendlyMessage: msg`List pinned field must belong to the view object`,
      },
    ];
  }

  return [];
};
