import { msg } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';
import { type PageLayoutWidgetPosition } from 'twenty-shared/types';
import {
  isDefined,
  isFrontComponentAvailableInWidgetPicker,
} from 'twenty-shared/utils';

import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { type PageLayoutIdentifierMaps } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-identifier-maps.type';
import { type PageLayoutToolContext } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';
import { type WidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout/tools/types/widget-configuration-input.type';

@Injectable()
export class PageLayoutToolService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async computePageLayoutIdentifierMaps({
    workspaceId,
  }: Pick<
    PageLayoutToolContext,
    'workspaceId'
  >): Promise<PageLayoutIdentifierMaps> {
    return this.workspaceCacheService.getOrRecompute(workspaceId, [
      'objectIdByName',
      'fieldIdByObjectIdAndName',
    ]);
  }

  async assertFrontComponentWidgetAvailableOnPageLayoutOrThrow({
    configuration,
    pageLayoutTabId,
    position,
    context,
  }: {
    configuration: WidgetConfigurationInput | undefined;
    pageLayoutTabId: string;
    position?: PageLayoutWidgetPosition;
    context: Pick<
      PageLayoutToolContext,
      'workspaceId' | 'callingApplication' | 'workspaceCustomApplicationId'
    >;
  }): Promise<void> {
    if (
      !isDefined(configuration) ||
      configuration.configurationType !==
        WidgetConfigurationType.FRONT_COMPONENT
    ) {
      return;
    }

    const tab = await this.pageLayoutTabService.findByIdOrThrow({
      id: pageLayoutTabId,
      workspaceId: context.workspaceId,
    });
    const pageLayout = await this.pageLayoutService.findByIdOrThrow({
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
        {
          userFriendlyMessage: msg`Choose an active tab and a widget position matching its layout mode.`,
        },
      );
    }

    const { flatFrontComponentMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
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
        { userFriendlyMessage: msg`Frontend component not found.` },
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
        {
          userFriendlyMessage: msg`This frontend component is not available on this page layout.`,
        },
      );
    }
  }
}
