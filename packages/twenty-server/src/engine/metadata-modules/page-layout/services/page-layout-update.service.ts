import { Injectable } from '@nestjs/common';

import { computeDiffBetweenObjects, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-tab/constants/flat-page-layout-tab-editable-properties.constant';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-widget/constants/flat-page-layout-widget-editable-properties.constant';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { reconstructFlatPageLayoutWithTabsAndWidgets } from 'src/engine/metadata-modules/flat-page-layout/utils/reconstruct-flat-page-layout-with-tabs-and-widgets.util';
import { UpdatePageLayoutTabWithWidgetsInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab-with-widgets.input';
import { UpdatePageLayoutWidgetWithIdInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget-with-id.input';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-with-tabs-and-widgets-to-page-layout-dto.util';
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

    // TODO move in validator
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
    ///

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { tabs, ...updateData } = input;

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
      propertiesToCompare: FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES,
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
        const existingTab = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: tabInput.id,
          flatEntityMaps: flatPageLayoutTabMaps,
        });

        return {
          ...existingTab,
          title: tabInput.title,
          position: tabInput.position,
          updatedAt: now.toISOString(),
        };
      },
    );

    const tabsToRestoreAndUpdate: FlatPageLayoutTab[] =
      entitiesToRestoreAndUpdate.map((tabInput) => {
        const existingTab = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: tabInput.id,
          flatEntityMaps: flatPageLayoutTabMaps,
        });

        return {
          ...existingTab,
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
  }: {
    tabs: UpdatePageLayoutTabWithWidgetsInput[];
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
    workspaceId: string;
    workspaceCustomApplicationId: string;
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
  }: {
    tabId: string;
    widgets: UpdatePageLayoutWidgetWithIdInput[];
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
    workspaceId: string;
    workspaceCustomApplicationId: string;
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
      propertiesToCompare: FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES,
    });

    const now = new Date();

    const widgetsToCreate: FlatPageLayoutWidget[] = entitiesToCreate.map(
      (widgetInput) => {
        const widgetId = widgetInput.id ?? v4();

        return {
          id: widgetId,
          pageLayoutTabId: widgetInput.pageLayoutTabId,
          title: widgetInput.title,
          type: widgetInput.type,
          objectMetadataId: widgetInput.objectMetadataId ?? null,
          gridPosition: widgetInput.gridPosition,
          configuration: widgetInput.configuration ?? null,
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
        const existingWidget = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: widgetInput.id,
          flatEntityMaps: flatPageLayoutWidgetMaps,
        });

        return {
          ...existingWidget,
          pageLayoutTabId: widgetInput.pageLayoutTabId,
          title: widgetInput.title,
          type: widgetInput.type,
          objectMetadataId: widgetInput.objectMetadataId ?? null,
          gridPosition: widgetInput.gridPosition,
          configuration: widgetInput.configuration ?? null,
          updatedAt: now.toISOString(),
        };
      },
    );

    const widgetsToRestoreAndUpdate: FlatPageLayoutWidget[] =
      entitiesToRestoreAndUpdate.map((widgetInput) => {
        const existingWidget = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: widgetInput.id,
          flatEntityMaps: flatPageLayoutWidgetMaps,
        });

        return {
          ...existingWidget,
          pageLayoutTabId: widgetInput.pageLayoutTabId,
          title: widgetInput.title,
          type: widgetInput.type,
          objectMetadataId: widgetInput.objectMetadataId ?? null,
          gridPosition: widgetInput.gridPosition,
          configuration: widgetInput.configuration ?? null,
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
}
