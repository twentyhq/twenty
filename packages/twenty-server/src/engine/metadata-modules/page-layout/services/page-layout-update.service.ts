import { Injectable } from '@nestjs/common';

import { computeDiffBetweenObjects, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { reconstructFlatPageLayoutWithTabsAndWidgets } from 'src/engine/metadata-modules/flat-page-layout/utils/reconstruct-flat-page-layout-with-tabs-and-widgets.util';
import { WIDGET_TYPES_REQUIRING_CONFIGURATION } from 'src/engine/metadata-modules/page-layout/constants/widget-types-requiring-configuration.constant';
import { UpdatePageLayoutTabWithWidgetsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-tab-with-widgets.input';
import { UpdatePageLayoutWidgetWithIdInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-widget-with-id.input';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { type WidgetConfigurationInterface } from 'src/engine/metadata-modules/page-layout/dtos/widget-configuration.interface';
import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout-widget.exception';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-with-tabs-and-widgets-to-page-layout-dto.util';
import { validateAndTransformWidgetConfiguration } from 'src/engine/metadata-modules/page-layout/utils/validate-and-transform-widget-configuration.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

type UpdatePageLayoutWithTabsParams = {
  id: string;
  workspaceId: string;
  input: UpdatePageLayoutWithTabsInput;
};

@Injectable()
export class PageLayoutUpdateService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async updatePageLayoutWithTabs({
    id,
    workspaceId,
    input,
  }: UpdatePageLayoutWithTabsParams): Promise<PageLayoutDTO> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPageLayoutMaps',
            'flatPageLayoutTabMaps',
            'flatPageLayoutWidgetMaps',
          ],
        },
      );

    const existingPageLayout = flatPageLayoutMaps.byId[id];

    if (
      !isDefined(existingPageLayout) ||
      isDefined(existingPageLayout.deletedAt)
    ) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { tabs, ...updateData } = input;

    const validatedConfigs = await this.validateAllWidgetConfigurations({
      tabs,
      workspaceId,
    });

    const flatPageLayoutToUpdate: FlatPageLayout = {
      ...existingPageLayout,
      name: updateData.name,
      type: updateData.type,
      objectMetadataId: updateData.objectMetadataId,
      updatedAt: new Date().toISOString(),
    };

    const { tabsToCreate, tabsToUpdate, tabsToDelete } =
      this.computeTabOperations({
        existingPageLayout,
        tabs,
        flatPageLayoutTabMaps,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      });

    const { widgetsToCreate, widgetsToUpdate, widgetsToDelete } =
      this.computeWidgetOperationsForAllTabs({
        tabs,
        flatPageLayoutWidgetMaps,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
        validatedConfigs,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutToUpdate],
            },
            pageLayoutTab: {
              flatEntityToCreate: tabsToCreate,
              flatEntityToDelete: tabsToDelete,
              flatEntityToUpdate: tabsToUpdate,
            },
            pageLayoutWidget: {
              flatEntityToCreate: widgetsToCreate,
              flatEntityToDelete: widgetsToDelete,
              flatEntityToUpdate: widgetsToUpdate,
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating page layout with tabs',
      );
    }

    const {
      flatPageLayoutMaps: recomputedFlatPageLayoutMaps,
      flatPageLayoutTabMaps: recomputedFlatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps: recomputedFlatPageLayoutWidgetMaps,
    } = await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatPageLayoutMaps',
          'flatPageLayoutTabMaps',
          'flatPageLayoutWidgetMaps',
        ],
      },
    );

    const flatLayout = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatPageLayoutMaps,
    });

    return fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto(
      reconstructFlatPageLayoutWithTabsAndWidgets({
        layout: flatLayout,
        flatPageLayoutTabMaps: recomputedFlatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps: recomputedFlatPageLayoutWidgetMaps,
      }),
    );
  }

  private computeTabOperations({
    existingPageLayout,
    tabs,
    flatPageLayoutTabMaps,
    workspaceId,
    workspaceCustomApplicationId,
  }: {
    existingPageLayout: FlatPageLayout;
    tabs: UpdatePageLayoutTabWithWidgetsInput[];
    flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
    workspaceId: string;
    workspaceCustomApplicationId: string;
  }): {
    tabsToCreate: FlatPageLayoutTab[];
    tabsToUpdate: FlatPageLayoutTab[];
    tabsToDelete: FlatPageLayoutTab[];
  } {
    const existingTabs = Object.values(flatPageLayoutTabMaps.byId)
      .filter(isDefined)
      .filter((tab) => tab.pageLayoutId === existingPageLayout.id);

    const {
      toCreate: entitiesToCreate,
      toUpdate: entitiesToUpdate,
      toRestoreAndUpdate: entitiesToRestoreAndUpdate,
      idsToDelete,
    } = computeDiffBetweenObjects<
      FlatPageLayoutTab,
      UpdatePageLayoutTabWithWidgetsInput
    >({
      existingObjects: existingTabs,
      receivedObjects: tabs,
      propertiesToCompare: ['title', 'position'],
    });

    const now = new Date();

    const tabsToCreate: FlatPageLayoutTab[] = entitiesToCreate.map(
      (tabInput) => {
        const tabId = tabInput.id ?? v4();

        return {
          id: tabId,
          title: tabInput.title,
          position: tabInput.position,
          pageLayoutId: existingPageLayout.id,
          workspaceId,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          deletedAt: null,
          universalIdentifier: tabId,
          applicationId: workspaceCustomApplicationId,
          widgetIds: [],
        };
      },
    );

    const tabsToUpdate: FlatPageLayoutTab[] = entitiesToUpdate.map(
      (tabInput) => {
        const existingTab = flatPageLayoutTabMaps.byId[tabInput.id];

        return {
          ...existingTab!,
          title: tabInput.title,
          position: tabInput.position,
          updatedAt: now.toISOString(),
        };
      },
    );

    const tabsToRestoreAndUpdate: FlatPageLayoutTab[] =
      entitiesToRestoreAndUpdate.map((tabInput) => {
        const existingTab = flatPageLayoutTabMaps.byId[tabInput.id];

        return {
          ...existingTab!,
          title: tabInput.title,
          position: tabInput.position,
          deletedAt: null,
          updatedAt: now.toISOString(),
        };
      });

    const tabsToDelete: FlatPageLayoutTab[] = idsToDelete
      .map((tabId) => {
        const existingTab = flatPageLayoutTabMaps.byId[tabId];

        if (!isDefined(existingTab)) {
          return null;
        }

        return {
          ...existingTab,
          deletedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
      })
      .filter(isDefined);

    return {
      tabsToCreate,
      tabsToUpdate: [
        ...tabsToUpdate,
        ...tabsToRestoreAndUpdate,
        ...tabsToDelete,
      ],
      tabsToDelete: [],
    };
  }

  private computeWidgetOperationsForAllTabs({
    tabs,
    flatPageLayoutWidgetMaps,
    workspaceId,
    workspaceCustomApplicationId,
    validatedConfigs,
  }: {
    tabs: UpdatePageLayoutTabWithWidgetsInput[];
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
    workspaceId: string;
    workspaceCustomApplicationId: string;
    validatedConfigs: Map<string, WidgetConfigurationInterface | null>;
  }): {
    widgetsToCreate: FlatPageLayoutWidget[];
    widgetsToUpdate: FlatPageLayoutWidget[];
    widgetsToDelete: FlatPageLayoutWidget[];
  } {
    const allWidgetsToCreate: FlatPageLayoutWidget[] = [];
    const allWidgetsToUpdate: FlatPageLayoutWidget[] = [];

    for (const tabInput of tabs) {
      const { widgetsToCreate, widgetsToUpdate } =
        this.computeWidgetOperationsForTab({
          tabId: tabInput.id,
          widgets: tabInput.widgets,
          flatPageLayoutWidgetMaps,
          workspaceId,
          workspaceCustomApplicationId,
          validatedConfigs,
        });

      allWidgetsToCreate.push(...widgetsToCreate);
      allWidgetsToUpdate.push(...widgetsToUpdate);
    }

    return {
      widgetsToCreate: allWidgetsToCreate,
      widgetsToUpdate: allWidgetsToUpdate,
      widgetsToDelete: [],
    };
  }

  private computeWidgetOperationsForTab({
    tabId,
    widgets,
    flatPageLayoutWidgetMaps,
    workspaceId,
    workspaceCustomApplicationId,
    validatedConfigs,
  }: {
    tabId: string;
    widgets: UpdatePageLayoutWidgetWithIdInput[];
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
    workspaceId: string;
    workspaceCustomApplicationId: string;
    validatedConfigs: Map<string, WidgetConfigurationInterface | null>;
  }): {
    widgetsToCreate: FlatPageLayoutWidget[];
    widgetsToUpdate: FlatPageLayoutWidget[];
  } {
    const existingWidgets = Object.values(flatPageLayoutWidgetMaps.byId)
      .filter(isDefined)
      .filter((widget) => widget.pageLayoutTabId === tabId);

    const {
      toCreate: entitiesToCreate,
      toUpdate: entitiesToUpdate,
      toRestoreAndUpdate: entitiesToRestoreAndUpdate,
      idsToDelete,
    } = computeDiffBetweenObjects<
      FlatPageLayoutWidget,
      UpdatePageLayoutWidgetWithIdInput
    >({
      existingObjects: existingWidgets,
      receivedObjects: widgets,
      propertiesToCompare: [
        'pageLayoutTabId',
        'objectMetadataId',
        'title',
        'type',
        'gridPosition',
        'configuration',
      ],
    });

    const now = new Date();

    const widgetsToCreate: FlatPageLayoutWidget[] = entitiesToCreate.map(
      (widgetInput) => {
        const widgetId = widgetInput.id ?? v4();
        const validatedConfig = validatedConfigs.get(widgetInput.id);

        return {
          id: widgetId,
          pageLayoutTabId: widgetInput.pageLayoutTabId,
          title: widgetInput.title,
          type: widgetInput.type,
          objectMetadataId: widgetInput.objectMetadataId ?? null,
          gridPosition: widgetInput.gridPosition,
          configuration:
            (validatedConfig as Record<string, unknown> | null) ??
            widgetInput.configuration ??
            null,
          workspaceId,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          deletedAt: null,
          universalIdentifier: widgetId,
          applicationId: workspaceCustomApplicationId,
        };
      },
    );

    const widgetsToUpdate: FlatPageLayoutWidget[] = entitiesToUpdate.map(
      (widgetInput) => {
        const existingWidget = flatPageLayoutWidgetMaps.byId[widgetInput.id];
        const validatedConfig = validatedConfigs.get(widgetInput.id);

        return {
          ...existingWidget!,
          pageLayoutTabId: widgetInput.pageLayoutTabId,
          title: widgetInput.title,
          type: widgetInput.type,
          objectMetadataId: widgetInput.objectMetadataId ?? null,
          gridPosition: widgetInput.gridPosition,
          configuration:
            (validatedConfig as Record<string, unknown> | null) ??
            widgetInput.configuration ??
            null,
          updatedAt: now.toISOString(),
        };
      },
    );

    const widgetsToRestoreAndUpdate: FlatPageLayoutWidget[] =
      entitiesToRestoreAndUpdate.map((widgetInput) => {
        const existingWidget = flatPageLayoutWidgetMaps.byId[widgetInput.id];
        const validatedConfig = validatedConfigs.get(widgetInput.id);

        return {
          ...existingWidget!,
          pageLayoutTabId: widgetInput.pageLayoutTabId,
          title: widgetInput.title,
          type: widgetInput.type,
          objectMetadataId: widgetInput.objectMetadataId ?? null,
          gridPosition: widgetInput.gridPosition,
          configuration:
            (validatedConfig as Record<string, unknown> | null) ??
            widgetInput.configuration ??
            null,
          deletedAt: null,
          updatedAt: now.toISOString(),
        };
      });

    const widgetsToDelete: FlatPageLayoutWidget[] = idsToDelete
      .map((widgetId) => {
        const existingWidget = flatPageLayoutWidgetMaps.byId[widgetId];

        if (!isDefined(existingWidget)) {
          return null;
        }

        return {
          ...existingWidget,
          deletedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
      })
      .filter(isDefined);

    return {
      widgetsToCreate,
      widgetsToUpdate: [
        ...widgetsToUpdate,
        ...widgetsToRestoreAndUpdate,
        ...widgetsToDelete,
      ],
    };
  }

  private async validateWidgetConfigurationOrThrow({
    type,
    configuration,
    workspaceId,
    titleForError,
  }: {
    type: WidgetType;
    configuration: Record<string, unknown>;
    workspaceId: string;
    titleForError: string;
  }): Promise<WidgetConfigurationInterface> {
    const isDashboardV2Enabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_DASHBOARD_V2_ENABLED,
      workspaceId,
    );

    let validatedConfig: WidgetConfigurationInterface | null = null;

    try {
      validatedConfig = await validateAndTransformWidgetConfiguration({
        type,
        configuration,
        isDashboardV2Enabled,
      });
    } catch (error) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_CONFIGURATION,
          titleForError,
          type,
          error instanceof Error ? error.message : String(error),
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    if (!isDefined(validatedConfig)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_CONFIGURATION,
          titleForError,
          type,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    return validatedConfig;
  }

  private async getValidatedConfigurationForWidget(
    widget: UpdatePageLayoutWidgetWithIdInput,
    workspaceId: string,
  ): Promise<WidgetConfigurationInterface | null> {
    const requiresConfiguration = WIDGET_TYPES_REQUIRING_CONFIGURATION.includes(
      widget.type,
    );

    if (!widget.configuration) {
      if (requiresConfiguration) {
        throw new PageLayoutWidgetException(
          generatePageLayoutWidgetExceptionMessage(
            PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_CONFIGURATION,
            widget.title,
            widget.type,
            'Configuration is required for this widget type',
          ),
          PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        );
      }

      return null;
    }

    return this.validateWidgetConfigurationOrThrow({
      type: widget.type,
      configuration: widget.configuration,
      workspaceId,
      titleForError: widget.title,
    });
  }

  private async validateAllWidgetConfigurations({
    tabs,
    workspaceId,
  }: {
    tabs: UpdatePageLayoutTabWithWidgetsInput[];
    workspaceId: string;
  }): Promise<Map<string, WidgetConfigurationInterface | null>> {
    const validatedConfigs = new Map<
      string,
      WidgetConfigurationInterface | null
    >();

    for (const tab of tabs) {
      for (const widget of tab.widgets) {
        const validatedConfig = await this.getValidatedConfigurationForWidget(
          widget,
          workspaceId,
        );

        validatedConfigs.set(widget.id, validatedConfig);
      }
    }

    return validatedConfigs;
  }
}
