import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { isDashboardInstalledByThirdPartyApplication } from 'src/engine/metadata-modules/page-layout/utils/is-dashboard-installed-by-third-party-application.util';

type PageLayoutWidgetConfiguration = FlatPageLayoutWidget['configuration'];

const getDashboardFilterBindings = (
  configuration: PageLayoutWidgetConfiguration | null | undefined,
) =>
  isDefined(configuration) && 'dashboardFilterBindings' in configuration
    ? configuration.dashboardFilterBindings
    : undefined;

const getComparableDashboardFilterBindings = (
  configuration: PageLayoutWidgetConfiguration | null | undefined,
) =>
  (getDashboardFilterBindings(configuration) ?? [])
    .map(
      ({ pageLayoutFilterId, fieldMetadataId }) =>
        `${pageLayoutFilterId}:${fieldMetadataId}`,
    )
    .sort();

export const getPageLayoutWidgetConfigurationToSaveOrThrow = ({
  pageLayout,
  existingConfiguration,
  configuration,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  pageLayout: Pick<
    FlatPageLayout,
    'id' | 'type' | 'applicationUniversalIdentifier'
  >;
  existingConfiguration: PageLayoutWidgetConfiguration | undefined;
  configuration: PageLayoutWidgetConfiguration;
  workspaceCustomApplicationUniversalIdentifier: string;
}): PageLayoutWidgetConfiguration => {
  if (
    !isDashboardInstalledByThirdPartyApplication({
      pageLayout,
      workspaceCustomApplicationUniversalIdentifier,
    })
  ) {
    return configuration;
  }

  if (
    !fastDeepEqual(
      getComparableDashboardFilterBindings(configuration),
      getComparableDashboardFilterBindings(existingConfiguration),
    )
  ) {
    throw new PageLayoutException(
      `Dashboard filter bindings of widgets on dashboard page layout "${pageLayout.id}" are defined by the application that installed it and cannot be changed`,
      PageLayoutExceptionCode.DASHBOARD_FILTER_BINDINGS_NOT_EDITABLE,
    );
  }

  if (
    !isDefined(configuration) ||
    !('dashboardFilterBindings' in configuration)
  ) {
    return configuration;
  }

  return {
    ...configuration,
    dashboardFilterBindings: getDashboardFilterBindings(existingConfiguration),
  };
};
