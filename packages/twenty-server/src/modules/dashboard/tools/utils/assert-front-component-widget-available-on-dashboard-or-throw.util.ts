import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';
import { type WidgetConfigurationInput } from 'src/modules/dashboard/tools/types/widget-configuration-input.type';

export const assertFrontComponentWidgetAvailableOnDashboardOrThrow = async ({
  configuration,
  deps,
  context,
}: {
  configuration: WidgetConfigurationInput | undefined;
  deps: Pick<DashboardToolDependencies, 'flatEntityMapsCacheService'>;
  context: DashboardToolContext;
}): Promise<void> => {
  if (
    !isDefined(configuration) ||
    configuration.configurationType !== WidgetConfigurationType.FRONT_COMPONENT
  ) {
    return;
  }

  const { flatFrontComponentMaps } =
    await deps.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId: context.workspaceId,
        flatMapsKeys: ['flatFrontComponentMaps'],
      },
    );

  const frontComponent = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: configuration.frontComponentId,
    flatEntityMaps: flatFrontComponentMaps,
  });

  if (!isDefined(frontComponent)) {
    throw new Error(
      `Frontend component "${configuration.frontComponentId}" does not exist`,
    );
  }

  const isAvailableOnDashboard =
    frontComponent.universalWidgetAvailability.some(
      ({ pageLayoutType }) => pageLayoutType === PageLayoutType.DASHBOARD,
    );

  if (!isAvailableOnDashboard) {
    throw new Error(
      `Frontend component "${frontComponent.name}" is not available on dashboards`,
    );
  }
};
