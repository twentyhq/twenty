import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ViewVisibility } from 'twenty-shared/types';
import { isDefined, isWidgetViewType } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { resolveEffectiveUniversalFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

const buildViewWidgetValidationError = ({
  message,
  userFriendlyMessage,
  value,
}: Omit<FlatPageLayoutWidgetValidationError, 'code'>) => ({
  code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
  message,
  userFriendlyMessage,
  value,
});

export const validateViewWidgetViewReference = ({
  flatEntityToValidate: {
    universalConfiguration,
    objectMetadataUniversalIdentifier,
    title: widgetTitle,
  },
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: { flatViewMaps },
  update,
}: GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs): FlatPageLayoutWidgetValidationError[] => {
  if (
    universalConfiguration?.configurationType !== WidgetConfigurationType.VIEW
  ) {
    return [];
  }

  if (
    isDefined(update) &&
    !isDefined(update.universalConfiguration) &&
    !isDefined(update.objectMetadataUniversalIdentifier)
  ) {
    return [];
  }

  const { viewUniversalIdentifier } = universalConfiguration;

  const flatView =
    isNonEmptyString(viewUniversalIdentifier) &&
    uuidValidate(viewUniversalIdentifier)
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier: viewUniversalIdentifier,
          flatEntityMaps: flatViewMaps,
        })
      : undefined;

  const effectiveView = isDefined(flatView)
    ? resolveEffectiveUniversalFlatEntity({
        metadataName: 'view',
        universalFlatEntity: flatView,
      })
    : undefined;

  if (
    !isDefined(effectiveView) ||
    isDefined(effectiveView.deletedAt) ||
    !effectiveView.isActive
  ) {
    return [
      buildViewWidgetValidationError({
        message: t`View widget "${widgetTitle}" must reference an existing view`,
        userFriendlyMessage: msg`View widget must reference an existing view`,
        value: viewUniversalIdentifier,
      }),
    ];
  }

  if (
    effectiveView.objectMetadataUniversalIdentifier !==
    objectMetadataUniversalIdentifier
  ) {
    return [
      buildViewWidgetValidationError({
        message: t`View widget "${widgetTitle}" references a view of another object`,
        userFriendlyMessage: msg`The selected view does not belong to the selected object`,
        value: viewUniversalIdentifier,
      }),
    ];
  }

  if (isWidgetViewType(effectiveView.type)) {
    return [
      buildViewWidgetValidationError({
        message: t`View widget "${widgetTitle}" references a view owned by a widget`,
        userFriendlyMessage: msg`The selected view cannot be displayed in a widget`,
        value: viewUniversalIdentifier,
      }),
    ];
  }

  if (effectiveView.visibility !== ViewVisibility.WORKSPACE) {
    return [
      buildViewWidgetValidationError({
        message: t`View widget "${widgetTitle}" references a view not shared with the workspace`,
        userFriendlyMessage: msg`Only views shared with the workspace can be displayed in a widget`,
        value: viewUniversalIdentifier,
      }),
    ];
  }

  return [];
};
