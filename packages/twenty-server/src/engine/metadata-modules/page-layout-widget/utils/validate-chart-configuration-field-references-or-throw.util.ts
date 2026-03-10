import { msg } from '@lingui/core/macro';

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { validateChartConfigurationFieldReferences } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-chart-configuration-field-references.util';

export const validateChartConfigurationFieldReferencesOrThrow = ({
  configuration,
  objectMetadataId,
  widgetType,
  widgetTitle,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  configuration: AllPageLayoutWidgetConfiguration;
  objectMetadataId?: string | null;
  widgetType?: WidgetType | null;
  widgetTitle?: string | null;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): void => {
  try {
    validateChartConfigurationFieldReferences({
      configuration,
      objectMetadataId,
      widgetType,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    });
  } catch (error) {
    const chartContextPrefix = isDefined(widgetTitle)
      ? `Chart "${widgetTitle}": `
      : '';
    const chartValidationMessage =
      chartContextPrefix +
      (error instanceof Error ? error.message : String(error));

    throw new PageLayoutWidgetException(
      chartValidationMessage,
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      {
        userFriendlyMessage: msg`${chartValidationMessage}`,
      },
    );
  }
};
