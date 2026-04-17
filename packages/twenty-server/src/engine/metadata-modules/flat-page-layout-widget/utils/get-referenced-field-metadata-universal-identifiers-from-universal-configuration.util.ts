import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

type UniversalConfiguration =
  FlatPageLayoutWidget['universalConfiguration'];

export const getReferencedFieldMetadataUniversalIdentifiersFromUniversalConfiguration =
  (universalConfiguration: UniversalConfiguration): string[] => {
    const identifiers: (string | null | undefined)[] = [];

    switch (universalConfiguration.configurationType) {
      case WidgetConfigurationType.AGGREGATE_CHART: {
        identifiers.push(
          universalConfiguration.aggregateFieldMetadataUniversalIdentifier,
          universalConfiguration.ratioAggregateConfig
            ?.fieldMetadataUniversalIdentifier,
        );
        break;
      }
      case WidgetConfigurationType.GAUGE_CHART: {
        identifiers.push(
          universalConfiguration.aggregateFieldMetadataUniversalIdentifier,
        );
        break;
      }
      case WidgetConfigurationType.PIE_CHART: {
        identifiers.push(
          universalConfiguration.aggregateFieldMetadataUniversalIdentifier,
          universalConfiguration.groupByFieldMetadataUniversalIdentifier,
        );
        break;
      }
      case WidgetConfigurationType.BAR_CHART:
      case WidgetConfigurationType.LINE_CHART: {
        identifiers.push(
          universalConfiguration.aggregateFieldMetadataUniversalIdentifier,
          universalConfiguration.primaryAxisGroupByFieldMetadataUniversalIdentifier,
          universalConfiguration.secondaryAxisGroupByFieldMetadataUniversalIdentifier,
        );
        break;
      }
      case WidgetConfigurationType.FIELD: {
        identifiers.push(universalConfiguration.fieldMetadataId);
        break;
      }
      case WidgetConfigurationType.FIELDS:
      case WidgetConfigurationType.RECORD_TABLE:
      case WidgetConfigurationType.FRONT_COMPONENT:
      case WidgetConfigurationType.VIEW:
      case WidgetConfigurationType.TIMELINE:
      case WidgetConfigurationType.TASKS:
      case WidgetConfigurationType.NOTES:
      case WidgetConfigurationType.FILES:
      case WidgetConfigurationType.EMAILS:
      case WidgetConfigurationType.CALENDAR:
      case WidgetConfigurationType.FIELD_RICH_TEXT:
      case WidgetConfigurationType.WORKFLOW:
      case WidgetConfigurationType.WORKFLOW_VERSION:
      case WidgetConfigurationType.WORKFLOW_RUN:
      case WidgetConfigurationType.IFRAME:
      case WidgetConfigurationType.STANDALONE_RICH_TEXT:
      case WidgetConfigurationType.EMAIL_THREAD:
        break;
    }

    if ('filter' in universalConfiguration) {
      const recordFilters = universalConfiguration.filter?.recordFilters;

      if (isDefined(recordFilters)) {
        for (const recordFilter of recordFilters) {
          identifiers.push(recordFilter.fieldMetadataUniversalIdentifier);
        }
      }
    }

    return identifiers.filter(isDefined);
  };
