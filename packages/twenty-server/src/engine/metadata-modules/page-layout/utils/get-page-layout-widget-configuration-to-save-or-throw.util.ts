import { isUndefined } from '@sniptt/guards';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DASHBOARD_FILTER_BINDINGS_SCHEMA } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/constants/dashboard-filter-bindings-schema.constant';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { isDashboardFilterBindingToMissingField } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-dashboard-filter-binding-to-missing-field.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { isChartReferencingFieldInConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-referencing-field-in-configuration.util';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { isOwnedByThirdPartyApplication } from 'src/engine/metadata-modules/page-layout/utils/is-owned-by-third-party-application.util';

type PageLayoutWidgetConfiguration = FlatPageLayoutWidget['configuration'];

const parseDashboardFilterBindingsOrThrow = (
  dashboardFilterBindings: unknown,
): DashboardFilterBinding[] | null | undefined => {
  const parsedDashboardFilterBindings =
    DASHBOARD_FILTER_BINDINGS_SCHEMA.safeParse(dashboardFilterBindings);

  if (!parsedDashboardFilterBindings.success) {
    throw new PageLayoutException(
      `Dashboard filter bindings are malformed: ${z.prettifyError(parsedDashboardFilterBindings.error)}`,
      PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
    );
  }

  return parsedDashboardFilterBindings.data;
};

const getComparableDashboardFilterBindings = (
  dashboardFilterBindings: DashboardFilterBinding[] | null | undefined,
): string[] =>
  (dashboardFilterBindings ?? [])
    .map(
      ({ pageLayoutFilterId, fieldMetadataId }) =>
        `${pageLayoutFilterId}:${fieldMetadataId}`,
    )
    .sort();

export const getPageLayoutWidgetConfigurationToSaveOrThrow = ({
  existingWidget,
  configuration,
  fieldMetadataUniversalIdentifierById,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  existingWidget:
    | Pick<
        FlatPageLayoutWidget,
        'id' | 'configuration' | 'applicationUniversalIdentifier'
      >
    | undefined;
  configuration: PageLayoutWidgetConfiguration;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  workspaceCustomApplicationUniversalIdentifier: string;
}): PageLayoutWidgetConfiguration => {
  if (
    !isDefined(configuration) ||
    (!isChartReferencingFieldInConfiguration(configuration) &&
      configuration.configurationType !== WidgetConfigurationType.RECORD_TABLE)
  ) {
    return configuration;
  }

  const dashboardFilterBindings = parseDashboardFilterBindingsOrThrow(
    configuration.dashboardFilterBindings,
  );

  const dashboardFilterBindingToMissingField = dashboardFilterBindings?.find(
    (dashboardFilterBinding) =>
      isDashboardFilterBindingToMissingField({
        dashboardFilterBinding,
        fieldMetadataUniversalIdentifierById,
      }),
  );

  if (isDefined(dashboardFilterBindingToMissingField)) {
    throw new PageLayoutException(
      `Dashboard filter "${dashboardFilterBindingToMissingField.pageLayoutFilterId}" is bound to field "${dashboardFilterBindingToMissingField.fieldMetadataId}", which does not exist`,
      PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
    );
  }

  if (!isDefined(existingWidget)) {
    return { ...configuration, dashboardFilterBindings };
  }

  const storedDashboardFilterBindings =
    'dashboardFilterBindings' in existingWidget.configuration
      ? existingWidget.configuration.dashboardFilterBindings
      : undefined;
  const existingDashboardFilterBindings = isDefined(
    storedDashboardFilterBindings,
  )
    ? storedDashboardFilterBindings.filter(
        (dashboardFilterBinding) =>
          !isDashboardFilterBindingToMissingField({
            dashboardFilterBinding,
            fieldMetadataUniversalIdentifierById,
          }),
      )
    : storedDashboardFilterBindings;

  if (isUndefined(dashboardFilterBindings)) {
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
    return { ...configuration, dashboardFilterBindings };
  }

  if (
    !fastDeepEqual(
      getComparableDashboardFilterBindings(dashboardFilterBindings),
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
