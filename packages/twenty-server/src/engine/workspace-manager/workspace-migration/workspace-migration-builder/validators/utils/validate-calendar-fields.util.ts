import { msg, t } from '@lingui/core/macro';
import {
  FieldMetadataType,
  ViewCalendarLayout,
  ViewType,
} from 'twenty-shared/types';
import { getViewLayoutFromViewType, isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateCalendarFields = ({
  flatView,
  flatFieldMetadataMaps,
  isCalendarWeekViewEnabled,
}: {
  flatView: UniversalFlatView;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
  isCalendarWeekViewEnabled: boolean;
}): FlatEntityValidationError[] => {
  if (getViewLayoutFromViewType(flatView.type) !== ViewType.CALENDAR) {
    return [];
  }

  const errors: FlatEntityValidationError[] = [];

  if (!isDefined(flatView.calendarLayout)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar view must have a calendar layout`,
      userFriendlyMessage: msg`Calendar view must have a calendar layout`,
    });
  }

  if (
    flatView.type === ViewType.CALENDAR_WIDGET &&
    !isCalendarWeekViewEnabled &&
    isDefined(flatView.calendarLayout) &&
    flatView.calendarLayout !== ViewCalendarLayout.MONTH
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar widget views only support the month layout`,
      userFriendlyMessage: msg`Calendar widget views only support the month layout`,
    });
  }

  if (!isDefined(flatView.calendarFieldMetadataUniversalIdentifier)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar view must have a calendar field`,
      userFriendlyMessage: msg`Calendar view must have a calendar field`,
    });

    return errors;
  }

  const calendarFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatView.calendarFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(calendarFieldMetadata)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar field metadata not found`,
      userFriendlyMessage: msg`Calendar field not found`,
    });

    return errors;
  }

  if (
    calendarFieldMetadata.objectMetadataUniversalIdentifier !==
    flatView.objectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar field must belong to the view object`,
      userFriendlyMessage: msg`Calendar field must belong to the view object`,
    });
  }

  const calendarFieldIsDateKind =
    calendarFieldMetadata.type === FieldMetadataType.DATE ||
    calendarFieldMetadata.type === FieldMetadataType.DATE_TIME;

  if (!calendarFieldIsDateKind) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar field must be a date or date time field`,
      userFriendlyMessage: msg`Calendar field must be a date or date time field`,
    });
  }

  if (!isDefined(flatView.calendarEndFieldMetadataUniversalIdentifier)) {
    return errors;
  }

  if (
    flatView.calendarEndFieldMetadataUniversalIdentifier ===
    flatView.calendarFieldMetadataUniversalIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar start and end fields must be different`,
      userFriendlyMessage: msg`Calendar start and end fields must be different`,
    });

    return errors;
  }

  const calendarEndFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatView.calendarEndFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(calendarEndFieldMetadata)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar end field metadata not found`,
      userFriendlyMessage: msg`Calendar end field not found`,
    });

    return errors;
  }

  if (
    calendarEndFieldMetadata.objectMetadataUniversalIdentifier !==
    flatView.objectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar end field must belong to the view object`,
      userFriendlyMessage: msg`Calendar end field must belong to the view object`,
    });
  }

  const calendarEndFieldIsDateKind =
    calendarEndFieldMetadata.type === FieldMetadataType.DATE ||
    calendarEndFieldMetadata.type === FieldMetadataType.DATE_TIME;

  if (!calendarEndFieldIsDateKind) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar end field must be a date or date time field`,
      userFriendlyMessage: msg`Calendar end field must be a date or date time field`,
    });
  } else if (
    calendarFieldIsDateKind &&
    calendarEndFieldMetadata.type !== calendarFieldMetadata.type
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Calendar start and end fields must have the same type`,
      userFriendlyMessage: msg`Calendar start and end fields must have the same type`,
    });
  }

  return errors;
};
