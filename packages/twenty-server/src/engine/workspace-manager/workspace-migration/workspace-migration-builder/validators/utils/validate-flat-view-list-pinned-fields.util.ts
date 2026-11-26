import { msg, t } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatViewListPinnedFields = ({
  flatView,
  flatFieldMetadataMaps,
}: {
  flatView: Pick<
    UniversalFlatView,
    'listPinnedFieldUniversalIdentifiers' | 'objectMetadataUniversalIdentifier'
  >;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError[] => {
  const { listPinnedFieldUniversalIdentifiers } = flatView;

  if (!isNonEmptyArray(listPinnedFieldUniversalIdentifiers)) {
    return [];
  }

  const errors: FlatEntityValidationError[] = [];

  if (
    new Set(listPinnedFieldUniversalIdentifiers).size !==
    listPinnedFieldUniversalIdentifiers.length
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`List pinned fields must not contain the same field twice`,
      userFriendlyMessage: msg`A field can only be pinned once`,
    });
  }

  const listPinnedFlatFieldMetadatas = listPinnedFieldUniversalIdentifiers.map(
    (universalIdentifier) =>
      findFlatEntityByUniversalIdentifier({
        universalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
  );

  if (!listPinnedFlatFieldMetadatas.every(isDefined)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`List pinned field metadata not found`,
      userFriendlyMessage: msg`List pinned field not found`,
    });
  }

  const hasPinnedFieldOfAnotherObject = listPinnedFlatFieldMetadatas.some(
    (flatFieldMetadata) =>
      isDefined(flatFieldMetadata) &&
      flatFieldMetadata.objectMetadataUniversalIdentifier !==
        flatView.objectMetadataUniversalIdentifier,
  );

  if (hasPinnedFieldOfAnotherObject) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`List pinned fields must belong to the view object`,
      userFriendlyMessage: msg`List pinned fields must belong to the view object`,
    });
  }

  return errors;
};
