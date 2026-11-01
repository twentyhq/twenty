import { type PageLayoutWidgetPosition } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';
import { type WidgetConfigurationInput } from 'src/modules/dashboard/tools/types/widget-configuration-input.type';

export const assertFrontComponentWidgetAvailableOnPageLayoutOrThrow = async ({
  configuration,
  pageLayoutTabId,
  position,
  deps,
  context,
}: {
  configuration: WidgetConfigurationInput | undefined;
  pageLayoutTabId: string;
  position?: PageLayoutWidgetPosition;
  deps: {
    flatEntityMapsCacheService: Pick<
      DashboardToolDependencies['flatEntityMapsCacheService'],
      'getOrRecomputeManyOrAllFlatEntityMaps'
    >;
    pageLayoutTabService: Pick<
      DashboardToolDependencies['pageLayoutTabService'],
      'findByIdOrThrow'
    >;
    pageLayoutService: Pick<
      DashboardToolDependencies['pageLayoutService'],
      'findByIdOrThrow'
    >;
  };
  context: DashboardToolContext;
}): Promise<void> => {
  if (
    !isDefined(configuration) ||
    configuration.configurationType !== WidgetConfigurationType.FRONT_COMPONENT
  ) {
    return;
  }

  const tab = await deps.pageLayoutTabService.findByIdOrThrow({
    id: pageLayoutTabId,
    workspaceId: context.workspaceId,
  });
  const pageLayout = await deps.pageLayoutService.findByIdOrThrow({
    id: tab.pageLayoutId,
    workspaceId: context.workspaceId,
  });

  if (
    !tab.isActive ||
    (isDefined(position) && position.layoutMode !== tab.layoutMode)
  ) {
    throw new Error(
      'Choose an active tab and a widget position matching its layout mode',
    );
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

  const isAvailable =
    !frontComponent.isHeadless &&
    frontComponent.widgetAvailability.some(
      ({ pageLayoutType, objectMetadataId }) =>
        pageLayoutType === pageLayout.type &&
        (!isDefined(objectMetadataId) ||
          objectMetadataId === pageLayout.objectMetadataId),
    );

  if (!isAvailable) {
    throw new Error(
      `Frontend component "${frontComponent.name}" is not available on this page layout`,
    );
  }
};
