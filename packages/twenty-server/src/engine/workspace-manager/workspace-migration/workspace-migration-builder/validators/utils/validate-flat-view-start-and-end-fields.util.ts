import { msg, t } from '@lingui/core/macro';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';
import { getViewLayoutFromViewType, isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatViewStartAndEndFields = ({
  flatView,
  flatFieldMetadataMaps,
}: {
  flatView: UniversalFlatView;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError[] => {
  const viewLayout = getViewLayoutFromViewType(flatView.type);

  if (viewLayout !== ViewType.CALENDAR && viewLayout !== ViewType.TIMELINE) {
    return [];
  }

  const errors: FlatEntityValidationError[] = [];

  if (viewLayout === ViewType.CALENDAR && !isDefined(flatView.calendarLayout)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar view must have a calendar layout`,
      userFriendlyMessage: msg`Calendar view must have a calendar layout`,
    });
  }

  if (!isDefined(flatView.startFieldMetadataUniversalIdentifier)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar and timeline views must have a start date field`,
      userFriendlyMessage: msg`Calendar and timeline views must have a start date field`,
    });

    return errors;
  }

  const startFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatView.startFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(startFieldMetadata)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Start date field metadata not found`,
      userFriendlyMessage: msg`Start date field not found`,
    });

    return errors;
  }

  if (
    startFieldMetadata.objectMetadataUniversalIdentifier !==
    flatView.objectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Start date field must belong to the view object`,
      userFriendlyMessage: msg`Start date field must belong to the view object`,
    });
  }

  const startFieldIsDateKind =
    startFieldMetadata.type === FieldMetadataType.DATE ||
    startFieldMetadata.type === FieldMetadataType.DATE_TIME;

  if (!startFieldIsDateKind) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Start date field must be a date or date time field`,
      userFriendlyMessage: msg`Start date field must be a date or date time field`,
    });
  }

  if (!isDefined(flatView.endFieldMetadataUniversalIdentifier)) {
    return errors;
  }

  if (
    flatView.endFieldMetadataUniversalIdentifier ===
    flatView.startFieldMetadataUniversalIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Start and end date fields must be different`,
      userFriendlyMessage: msg`Start and end date fields must be different`,
    });

    return errors;
  }

  const endFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatView.endFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(endFieldMetadata)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`End date field metadata not found`,
      userFriendlyMessage: msg`End date field not found`,
    });

    return errors;
  }

  if (
    endFieldMetadata.objectMetadataUniversalIdentifier !==
    flatView.objectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`End date field must belong to the view object`,
      userFriendlyMessage: msg`End date field must belong to the view object`,
    });
  }

  const endFieldIsDateKind =
    endFieldMetadata.type === FieldMetadataType.DATE ||
    endFieldMetadata.type === FieldMetadataType.DATE_TIME;

  if (!endFieldIsDateKind) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`End date field must be a date or date time field`,
      userFriendlyMessage: msg`End date field must be a date or date time field`,
    });
  } else if (
    startFieldIsDateKind &&
    endFieldMetadata.type !== startFieldMetadata.type
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Start and end date fields must have the same type`,
      userFriendlyMessage: msg`Start and end date fields must have the same type`,
    });
  }

  return errors;
};
