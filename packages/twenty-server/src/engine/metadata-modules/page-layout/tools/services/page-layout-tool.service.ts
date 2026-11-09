import { Injectable } from '@nestjs/common';
import { type ToolSet } from 'ai';
import { type PageLayoutWidgetPosition } from 'twenty-shared/types';
import {
  isDefined,
  isFrontComponentAvailableInWidgetPicker,
} from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type ApplicationCallerOperation } from 'src/engine/core-modules/application/types/application-caller-operation.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildFieldIdByNameMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-id-by-name-maps.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { createAddPageLayoutTabTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-tab.tool';
import { createAddPageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-widget.tool';
import { createDeletePageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/delete-page-layout-widget.tool';
import { createListRecordPageLayoutsTool } from 'src/engine/metadata-modules/page-layout/tools/list-record-page-layouts.tool';
import { createPlaceFrontComponentTool } from 'src/engine/metadata-modules/page-layout/tools/place-front-component.tool';
import { type PageLayoutIdentifierMaps } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-identifier-maps.type';
import {
  type PageLayoutToolContext,
  type PageLayoutToolDependencies,
} from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';
import { type WidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout/tools/types/widget-configuration-input.type';
import { createUpdatePageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/update-page-layout-widget.tool';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { createCreateCompleteDashboardTool } from 'src/modules/dashboard/tools/create-complete-dashboard.tool';
import { createGetDashboardTool } from 'src/modules/dashboard/tools/get-dashboard.tool';
import { createListDashboardsTool } from 'src/modules/dashboard/tools/list-dashboards.tool';

@Injectable()
export class PageLayoutToolService {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  generatePageLayoutTools({
    workspaceId,
    authContext,
    callingApplication,
  }: {
    workspaceId: string;
    authContext: WorkspaceAuthContext;
    callingApplication: ApplicationCallerOperation['callingApplication'];
  }): ToolSet {
    const dependencies: PageLayoutToolDependencies = {
      pageLayoutService: this.pageLayoutService,
      pageLayoutTabService: this.pageLayoutTabService,
      pageLayoutWidgetService: this.pageLayoutWidgetService,
      workspaceOrmManager: this.workspaceOrmManager,
      recordPositionService: this.recordPositionService,
      applicationService: this.applicationService,
      flatEntityMapsCacheService: this.flatEntityMapsCacheService,
      pageLayoutToolService: this,
    };
    const context = {
      workspaceId,
      callingApplication,
      workspaceCustomApplicationId:
        authContext.workspace.workspaceCustomApplicationId ?? undefined,
    };
    const contextWithPermissions = { ...context, authContext };

    const createCompleteDashboard = createCreateCompleteDashboardTool(
      dependencies,
      contextWithPermissions,
    );
    const listDashboards = createListDashboardsTool(
      dependencies,
      contextWithPermissions,
    );
    const getDashboard = createGetDashboardTool(
      dependencies,
      contextWithPermissions,
    );
    const addPageLayoutTab = createAddPageLayoutTabTool(dependencies, context);
    const addPageLayoutWidget = createAddPageLayoutWidgetTool({
      deps: dependencies,
      context,
    });
    const updatePageLayoutWidget = createUpdatePageLayoutWidgetTool(
      dependencies,
      context,
    );
    const deletePageLayoutWidget = createDeletePageLayoutWidgetTool({
      deps: dependencies,
      context,
    });

    const placeFrontComponent = createPlaceFrontComponentTool({
      deps: dependencies,
      context,
    });
    const listRecordPageLayouts = createListRecordPageLayoutsTool({
      deps: dependencies,
      context,
    });

    return {
      [placeFrontComponent.name]: placeFrontComponent,
      [listRecordPageLayouts.name]: listRecordPageLayouts,
      [createCompleteDashboard.name]: createCompleteDashboard,
      [listDashboards.name]: listDashboards,
      [getDashboard.name]: getDashboard,
      [addPageLayoutTab.name]: addPageLayoutTab,
      [addPageLayoutWidget.name]: addPageLayoutWidget,
      [updatePageLayoutWidget.name]: updatePageLayoutWidget,
      [deletePageLayoutWidget.name]: deletePageLayoutWidget,
    };
  }

  async computePageLayoutIdentifierMaps({
    workspaceId,
  }: Pick<
    PageLayoutToolContext,
    'workspaceId'
  >): Promise<PageLayoutIdentifierMaps> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { idByNameSingular, idByNamePlural } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    const { fieldIdByObjectIdAndName } = buildFieldIdByNameMaps(
      flatFieldMetadataMaps,
    );

    return {
      objectIdByName: { ...idByNamePlural, ...idByNameSingular },
      fieldIdByObjectIdAndName,
    };
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
    context: PageLayoutToolContext;
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
  }
}
