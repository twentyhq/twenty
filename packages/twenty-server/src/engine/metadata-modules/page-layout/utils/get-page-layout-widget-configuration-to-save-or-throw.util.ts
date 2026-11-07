import { isArray, isUndefined } from '@sniptt/guards';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { fastDeepEqual, isDefined, isPlainObject } from 'twenty-shared/utils';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { isChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-referencing-field-in-configuration.util';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { isOwnedByThirdPartyApplication } from 'src/engine/metadata-modules/page-layout/utils/is-owned-by-third-party-application.util';

type PageLayoutWidgetConfiguration = FlatPageLayoutWidget['configuration'];

const getComparableDashboardFilterBindings = (
  dashboardFilterBindings: DashboardFilterBinding[] | null | undefined,
): string[] | undefined => {
  const bindings = dashboardFilterBindings ?? [];

  return isArray(bindings) && bindings.every(isPlainObject)
    ? bindings
        .map(
          ({ pageLayoutFilterId, fieldMetadataId }) =>
            `${pageLayoutFilterId}:${fieldMetadataId}`,
        )
        .sort()
    : undefined;
};

export const getPageLayoutWidgetConfigurationToSaveOrThrow = ({
  existingWidget,
  configuration,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  existingWidget:
    | Pick<
        FlatPageLayoutWidget,
        'id' | 'configuration' | 'applicationUniversalIdentifier'
      >
    | undefined;
  configuration: PageLayoutWidgetConfiguration;
  workspaceCustomApplicationUniversalIdentifier: string;
}): PageLayoutWidgetConfiguration => {
  if (
    !isDefined(existingWidget) ||
    !isDefined(configuration) ||
    (!isChartReferencingFieldInConfiguration(configuration) &&
      configuration.configurationType !== WidgetConfigurationType.RECORD_TABLE)
  ) {
    return configuration;
  }

  const existingDashboardFilterBindings =
    'dashboardFilterBindings' in existingWidget.configuration
      ? existingWidget.configuration.dashboardFilterBindings
      : undefined;

  if (isUndefined(configuration.dashboardFilterBindings)) {
    return {
      ...configuration,
      dashboardFilterBindings: existingDashboardFilterBindings,
    };
  }

  if (
    !isOwnedByThirdPartyApplication({
      applicationUniversalIdentifier:
        existingWidget.applicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    })
  ) {
    return configuration;
  }

  if (
    !fastDeepEqual(
      getComparableDashboardFilterBindings(
        configuration.dashboardFilterBindings,
      ),
      getComparableDashboardFilterBindings(existingDashboardFilterBindings),
    )
  ) {
    throw new PageLayoutException(
      `Dashboard filter bindings of page layout widget "${existingWidget.id}" are defined by the application that installed it and cannot be changed`,
      PageLayoutExceptionCode.DASHBOARD_FILTER_BINDINGS_NOT_EDITABLE,
    );
  }

  return {
    ...configuration,
    dashboardFilterBindings: existingDashboardFilterBindings,
  };
};
