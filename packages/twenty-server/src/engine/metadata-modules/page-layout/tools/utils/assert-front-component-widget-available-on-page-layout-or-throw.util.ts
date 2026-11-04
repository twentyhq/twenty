import { type PageLayoutWidgetPosition } from 'twenty-shared/types';
import {
  isDefined,
  isFrontComponentAvailableInWidgetPicker,
} from 'twenty-shared/utils';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import {
  type PageLayoutToolContext,
  type PageLayoutToolDependencies,
} from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';
import { type WidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout/tools/types/widget-configuration-input.type';

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
      PageLayoutToolDependencies['flatEntityMapsCacheService'],
      'getOrRecomputeManyOrAllFlatEntityMaps'
    >;
    pageLayoutTabService: Pick<
      PageLayoutToolDependencies['pageLayoutTabService'],
      'findByIdOrThrow'
    >;
    pageLayoutService: Pick<
      PageLayoutToolDependencies['pageLayoutService'],
      'findByIdOrThrow'
    >;
  };
  context: Pick<
    PageLayoutToolContext,
    'workspaceId' | 'callingApplication' | 'workspaceCustomApplicationId'
  >;
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
    throw new PageLayoutWidgetException(
      'Choose an active tab and a widget position matching its layout mode',
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
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

  if (
    !isDefined(frontComponent) ||
    !canCallerReachApplication({
      applicationId: frontComponent.applicationId,
      callingApplication: context.callingApplication,
      workspaceCustomApplicationId: context.workspaceCustomApplicationId,
      operation: 'read',
    })
  ) {
    throw new PageLayoutWidgetException(
      `Frontend component "${configuration.frontComponentId}" does not exist`,
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  const isAvailable = isFrontComponentAvailableInWidgetPicker({
    frontComponent,
    pageLayoutType: pageLayout.type,
    objectMetadataId: pageLayout.objectMetadataId,
  });

  if (!isAvailable) {
    throw new PageLayoutWidgetException(
      `Frontend component "${frontComponent.name}" is not available on this page layout`,
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }
};
