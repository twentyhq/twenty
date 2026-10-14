import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { ViewVisibility } from 'twenty-shared/types';
import { isDefined, isWidgetViewType } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

const buildViewReferenceValidationException = ({
  message,
  userFriendlyMessage,
  widgetTitle,
}: {
  message: string;
  userFriendlyMessage: MessageDescriptor;
  widgetTitle?: string | null;
}): PageLayoutWidgetException => {
  const prefix = isDefined(widgetTitle) ? `Widget "${widgetTitle}": ` : '';

  return new PageLayoutWidgetException(
    prefix + message,
    PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    { userFriendlyMessage },
  );
};

// The widget only references the view: widget-owned views and personal views
// cannot be shared through a dashboard.
export const validateViewConfigurationReferenceOrThrow = ({
  widgetConfiguration,
  widgetObjectMetadataId,
  widgetTitle,
  flatViewMaps,
}: {
  widgetConfiguration?: AllPageLayoutWidgetConfiguration | null;
  widgetObjectMetadataId?: string | null;
  widgetTitle?: string | null;
  flatViewMaps: FlatEntityMaps<FlatView>;
}): void => {
  if (widgetConfiguration?.configurationType !== WidgetConfigurationType.VIEW) {
    return;
  }

  const flatView = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: widgetConfiguration.viewId,
    flatEntityMaps: flatViewMaps,
  });

  if (
    !isDefined(flatView) ||
    isDefined(flatView.deletedAt) ||
    !resolveEffectiveFlatEntityProperty({
      metadataName: 'view',
      flatEntity: flatView,
      property: 'isActive',
    })
  ) {
    throw buildViewReferenceValidationException({
      message: `viewId "${widgetConfiguration.viewId}" not found.`,
      userFriendlyMessage: msg`The selected view does not exist`,
      widgetTitle,
    });
  }

  if (flatView.objectMetadataId !== widgetObjectMetadataId) {
    throw buildViewReferenceValidationException({
      message: `View "${flatView.id}" does not belong to objectMetadataId "${widgetObjectMetadataId}".`,
      userFriendlyMessage: msg`The selected view does not belong to the selected object`,
      widgetTitle,
    });
  }

  if (
    isWidgetViewType(
      resolveEffectiveFlatEntityProperty({
        metadataName: 'view',
        flatEntity: flatView,
        property: 'type',
      }),
    )
  ) {
    throw buildViewReferenceValidationException({
      message: `View "${flatView.id}" is owned by a widget and cannot be referenced.`,
      userFriendlyMessage: msg`The selected view cannot be displayed in a widget`,
      widgetTitle,
    });
  }

  if (
    resolveEffectiveFlatEntityProperty({
      metadataName: 'view',
      flatEntity: flatView,
      property: 'visibility',
    }) !== ViewVisibility.WORKSPACE
  ) {
    throw buildViewReferenceValidationException({
      message: `View "${flatView.id}" is not shared with the workspace.`,
      userFriendlyMessage: msg`Only views shared with the workspace can be displayed in a widget`,
      widgetTitle,
    });
  }
};
