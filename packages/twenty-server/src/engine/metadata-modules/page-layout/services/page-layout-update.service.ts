import { Injectable, Logger } from '@nestjs/common';

import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { computeDiffBetweenObjects, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { splitEntitiesByRemovalStrategy } from 'src/engine/metadata-modules/flat-entity/utils/split-entities-by-removal-strategy.util';
import { FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-tab/constants/flat-page-layout-tab-editable-properties.constant';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-widget/constants/flat-page-layout-widget-editable-properties.constant';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { buildFlatPageLayoutWidgetCommonProperties } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/build-flat-page-layout-widget-common-properties.util';
import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { fromPageLayoutWidgetOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-overrides-to-universal-overrides.util';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { reconstructFlatPageLayoutWithTabsAndWidgets } from 'src/engine/metadata-modules/flat-page-layout/utils/reconstruct-flat-page-layout-with-tabs-and-widgets.util';
import { UpdatePageLayoutTabWithWidgetsInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab-with-widgets.input';
import { UpdatePageLayoutWidgetWithIdInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget-with-id.input';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { validateChartConfigurationFieldReferencesOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-chart-configuration-field-references.util';
import { UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';
import { PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-with-tabs-and-widgets-to-page-layout-dto.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { resolveFlatEntityOverridableProperties } from 'src/engine/metadata-modules/utils/resolve-flat-entity-overridable-properties.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';

type UpdatePageLayoutWithTabsParams = {
  id: string;
  workspaceId: string;
  input: UpdatePageLayoutWithTabsInput;
};

@Injectable()
export class PageLayoutUpdateService {
  private readonly logger = new Logger(PageLayoutUpdateService.name);

  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly dashboardSyncService: DashboardSyncService,
    private readonly viewService: ViewService,
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

    const existingPageLayout = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatPageLayoutMaps,
    });

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
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatFrontComponentMaps,
      flatViewFieldGroupMaps,
      flatViewMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatFrontComponentMaps',
            'flatViewFieldGroupMaps',
            'flatViewMaps',
          ],
        },
      );

    const optimisticFlatPageLayoutTabMaps = tabsToCreate.reduce(
      (maps, tab) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: tab,
          flatEntityMaps: maps,
        }),
      flatPageLayoutTabMaps,
    );

    const { widgetsToCreate, widgetsToUpdate, widgetsToDelete } =
      this.computeWidgetOperationsForAllTabs({
        tabs,
        flatPageLayoutWidgetMaps,
        flatPageLayoutTabMaps: optimisticFlatPageLayoutTabMaps,
        flatObjectMetadataMaps,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatFieldMetadataMaps,
        flatFrontComponentMaps,
        flatViewFieldGroupMaps,
        flatViewMaps,
      });

    const orphanedViewIds = this.collectOrphanedViewIdsFromRemovedWidgets({
      widgetsToCreate,
      widgetsToUpdate,
      widgetsToDelete,
      tabsToUpdate,
      tabsToDelete,
      flatPageLayoutWidgetMaps,
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
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
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

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByPageLayoutId(
      {
        pageLayoutId: id,
        workspaceId,
        updatedAt: new Date(flatLayout.updatedAt),
      },
    );

    await this.destroyOrphanedFieldsWidgetViews({
      viewIds: orphanedViewIds,
      workspaceId,
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
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    existingPageLayout: FlatPageLayout;
    tabs: UpdatePageLayoutTabWithWidgetsInput[];
    flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
    workspaceId: string;
    workspaceCustomApplicationId: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  }): {
    tabsToCreate: FlatPageLayoutTab[];
    tabsToUpdate: FlatPageLayoutTab[];
    tabsToDelete: FlatPageLayoutTab[];
  } {
    const existingTabs = Object.values(
      flatPageLayoutTabMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((tab) => tab.pageLayoutId === existingPageLayout.id);

    const resolvedExistingTabs = existingTabs.map(
      resolveFlatEntityOverridableProperties,
    );

    const {
      toCreate: entitiesToCreate,
      toUpdate: entitiesToUpdate,
      toRestoreAndUpdate: entitiesToRestoreAndUpdate,
      idsToRemove,
    } = computeDiffBetweenObjects<
      FlatPageLayoutTab,
      UpdatePageLayoutTabWithWidgetsInput
    >({
      existingObjects: resolvedExistingTabs,
      receivedObjects: tabs,
      propertiesToCompare: FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES,
      isEntityIncluded: (entity) => entity.isActive,
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
          pageLayoutUniversalIdentifier: existingPageLayout.universalIdentifier,
          workspaceId,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          deletedAt: null,
          universalIdentifier: tabId,
          applicationId: workspaceCustomApplicationId,
          applicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          widgetIds: [],
          widgetUniversalIdentifiers: [],
          icon: null,
          layoutMode: tabInput.layoutMode ?? PageLayoutTabLayoutMode.GRID,
          overrides: null,
          isActive: true,
        };
      },
    );

    const tabsToUpdate: FlatPageLayoutTab[] = entitiesToUpdate.map(
      (tabInput) => {
        const existingTab = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: tabInput.id,
          flatEntityMaps: flatPageLayoutTabMaps,
        });

        const shouldOverride = isCallerOverridingEntity({
          callerApplicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          entityApplicationUniversalIdentifier:
            existingTab.applicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
        });

        const editableProperties = {
          title: tabInput.title,
          position: tabInput.position,
          ...(tabInput.icon !== undefined && { icon: tabInput.icon }),
          layoutMode: tabInput.layoutMode ?? existingTab.layoutMode,
        };

        const { overrides, updatedEditableProperties } =
          sanitizeOverridableEntityInput({
            metadataName: 'pageLayoutTab',
            existingFlatEntity: existingTab,
            updatedEditableProperties: editableProperties,
            shouldOverride,
          });

        return {
          ...existingTab,
          ...updatedEditableProperties,
          overrides,
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

        const shouldOverride = isCallerOverridingEntity({
          callerApplicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          entityApplicationUniversalIdentifier:
            existingTab.applicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
        });

        const editableProperties = {
          title: tabInput.title,
          position: tabInput.position,
          ...(tabInput.icon !== undefined && { icon: tabInput.icon }),
          layoutMode: tabInput.layoutMode ?? existingTab.layoutMode,
        };

        const { overrides, updatedEditableProperties } =
          sanitizeOverridableEntityInput({
            metadataName: 'pageLayoutTab',
            existingFlatEntity: existingTab,
            updatedEditableProperties: editableProperties,
            shouldOverride,
          });

        return {
          ...existingTab,
          ...updatedEditableProperties,
          overrides,
          isActive: true,
          updatedAt: now.toISOString(),
        };
      });

    const tabsToRemove = idsToRemove
      .map((tabId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: tabId,
          flatEntityMaps: flatPageLayoutTabMaps,
        }),
      )
      .filter(isDefined);

    const { toHardDelete, toDeactivate } = splitEntitiesByRemovalStrategy({
      entitiesToRemove: tabsToRemove,
      workspaceCustomApplicationUniversalIdentifier,
      now: now.toISOString(),
    });

    return {
      tabsToCreate,
      tabsToUpdate: [
        ...tabsToUpdate,
        ...tabsToRestoreAndUpdate,
        ...toDeactivate,
      ],
      tabsToDelete: toHardDelete,
    };
  }

  private computeWidgetOperationsForAllTabs({
    tabs,
    flatPageLayoutWidgetMaps,
    flatPageLayoutTabMaps,
    flatObjectMetadataMaps,
    workspaceId,
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
    flatFieldMetadataMaps,
    flatFrontComponentMaps,
    flatViewFieldGroupMaps,
    flatViewMaps,
  }: {
    tabs: UpdatePageLayoutTabWithWidgetsInput[];
    workspaceId: string;
    workspaceCustomApplicationId: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatFrontComponentMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatViewMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
  >): {
    widgetsToCreate: FlatPageLayoutWidget[];
    widgetsToUpdate: FlatPageLayoutWidget[];
    widgetsToDelete: FlatPageLayoutWidget[];
  } {
    const allWidgetsToCreate: FlatPageLayoutWidget[] = [];
    const allWidgetsToUpdate: FlatPageLayoutWidget[] = [];
    const allWidgetsToDelete: FlatPageLayoutWidget[] = [];

    const widgetIdsAcrossAllTabs = new Set(
      tabs.flatMap((tab) => tab.widgets.map((widget) => widget.id)),
    );

    for (const tabInput of tabs) {
      const { widgetsToCreate, widgetsToUpdate, widgetsToDelete } =
        this.computeWidgetOperationsForTab({
          tabId: tabInput.id,
          widgets: tabInput.widgets,
          widgetIdsAcrossAllTabs,
          flatPageLayoutWidgetMaps,
          flatPageLayoutTabMaps,
          flatObjectMetadataMaps,
          workspaceId,
          workspaceCustomApplicationId,
          workspaceCustomApplicationUniversalIdentifier,
          flatFieldMetadataMaps,
          flatFrontComponentMaps,
          flatViewFieldGroupMaps,
          flatViewMaps,
        });

      allWidgetsToCreate.push(...widgetsToCreate);
      allWidgetsToUpdate.push(...widgetsToUpdate);
      allWidgetsToDelete.push(...widgetsToDelete);
    }

    return {
      widgetsToCreate: allWidgetsToCreate,
      widgetsToUpdate: allWidgetsToUpdate,
      widgetsToDelete: allWidgetsToDelete,
    };
  }

  private computeWidgetOperationsForTab({
    tabId,
    widgets,
    widgetIdsAcrossAllTabs,
    flatPageLayoutWidgetMaps,
    flatPageLayoutTabMaps,
    flatObjectMetadataMaps,
    workspaceId,
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
    flatFieldMetadataMaps,
    flatFrontComponentMaps,
    flatViewFieldGroupMaps,
    flatViewMaps,
  }: {
    tabId: string;
    widgets: UpdatePageLayoutWidgetWithIdInput[];
    widgetIdsAcrossAllTabs: Set<string>;
    workspaceId: string;
    workspaceCustomApplicationId: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatFrontComponentMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatViewMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
  >): {
    widgetsToCreate: FlatPageLayoutWidget[];
    widgetsToUpdate: FlatPageLayoutWidget[];
    widgetsToDelete: FlatPageLayoutWidget[];
  } {
    for (const widgetInput of widgets) {
      this.validateChartFieldReferences({
        widgetInput,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });
    }

    const widgetIdsInCurrentTabInput = new Set(
      widgets.map((widget) => widget.id),
    );

    const existingWidgets = this.findWidgetsInTabOrMovingToTab({
      tabId,
      widgetIdsInCurrentTabInput,
      flatPageLayoutWidgetMaps,
    });

    const resolvedExistingWidgets = existingWidgets.map(
      resolveFlatEntityOverridableProperties,
    );

    const {
      toCreate: entitiesToCreate,
      toUpdate: entitiesToUpdate,
      toRestoreAndUpdate: entitiesToRestoreAndUpdate,
      idsToRemove,
    } = computeDiffBetweenObjects<
      FlatPageLayoutWidget,
      UpdatePageLayoutWidgetWithIdInput
    >({
      existingObjects: resolvedExistingWidgets,
      receivedObjects: widgets,
      propertiesToCompare: FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES,
      isEntityIncluded: (entity) => entity.isActive,
    });

    const now = new Date();

    const widgetsToCreate: FlatPageLayoutWidget[] = entitiesToCreate.map(
      (widgetInput) => {
        const widgetId = widgetInput.id ?? v4();

        return {
          id: widgetId,
          ...buildFlatPageLayoutWidgetCommonProperties({
            widgetInput,
            flatPageLayoutTabMaps,
            flatObjectMetadataMaps,
          }),
          configuration: widgetInput.configuration,
          workspaceId,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          deletedAt: null,
          universalIdentifier: widgetId,
          applicationId: workspaceCustomApplicationId,
          applicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          conditionalDisplay: widgetInput.conditionalDisplay ?? null,
          conditionalAvailabilityExpression:
            widgetInput.conditionalAvailabilityExpression ?? null,
          overrides: null,
          universalOverrides: null,
          isActive: true,
          universalConfiguration:
            fromPageLayoutWidgetConfigurationToUniversalConfiguration({
              configuration: widgetInput.configuration,
              fieldMetadataUniversalIdentifierById:
                flatFieldMetadataMaps.universalIdentifierById,
              frontComponentUniversalIdentifierById:
                flatFrontComponentMaps.universalIdentifierById,
              viewFieldGroupUniversalIdentifierById:
                flatViewFieldGroupMaps.universalIdentifierById,
              viewUniversalIdentifierById: flatViewMaps.universalIdentifierById,
            }),
        };
      },
    );

    const widgetsToUpdate: FlatPageLayoutWidget[] = entitiesToUpdate.map(
      (widgetInput) =>
        this.buildUpdatedFlatPageLayoutWidget({
          widgetInput,
          flatPageLayoutWidgetMaps,
          flatPageLayoutTabMaps,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          flatFrontComponentMaps,
          flatViewFieldGroupMaps,
          flatViewMaps,
          workspaceCustomApplicationUniversalIdentifier,
          now,
        }),
    );

    const widgetsToRestoreAndUpdate: FlatPageLayoutWidget[] =
      entitiesToRestoreAndUpdate.map((widgetInput) => ({
        ...this.buildUpdatedFlatPageLayoutWidget({
          widgetInput,
          flatPageLayoutWidgetMaps,
          flatPageLayoutTabMaps,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          flatFrontComponentMaps,
          flatViewFieldGroupMaps,
          flatViewMaps,
          workspaceCustomApplicationUniversalIdentifier,
          now,
        }),
        isActive: true,
      }));

    const widgetIdsToRemoveExcludingMovedToOtherTabs =
      this.excludeWidgetsMovedToOtherTabs({
        idsToRemove,
        widgetIdsAcrossAllTabs,
      });

    const widgetsToRemove = widgetIdsToRemoveExcludingMovedToOtherTabs
      .map((widgetId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: widgetId,
          flatEntityMaps: flatPageLayoutWidgetMaps,
        }),
      )
      .filter(isDefined);

    const { toHardDelete, toDeactivate } = splitEntitiesByRemovalStrategy({
      entitiesToRemove: widgetsToRemove,
      workspaceCustomApplicationUniversalIdentifier,
      now: now.toISOString(),
    });

    return {
      widgetsToCreate,
      widgetsToUpdate: [
        ...widgetsToUpdate,
        ...widgetsToRestoreAndUpdate,
        ...toDeactivate,
      ],
      widgetsToDelete: toHardDelete,
    };
  }

  private buildUpdatedFlatPageLayoutWidget({
    widgetInput,
    flatPageLayoutWidgetMaps,
    flatPageLayoutTabMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatFrontComponentMaps,
    flatViewFieldGroupMaps,
    flatViewMaps,
    workspaceCustomApplicationUniversalIdentifier,
    now,
  }: {
    widgetInput: UpdatePageLayoutWidgetWithIdInput;
    workspaceCustomApplicationUniversalIdentifier: string;
    now: Date;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatFrontComponentMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatViewMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
  >): FlatPageLayoutWidget {
    const existingWidget = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: widgetInput.id,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });

    const shouldOverride = isCallerOverridingEntity({
      callerApplicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
      entityApplicationUniversalIdentifier:
        existingWidget.applicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    });

    const configuration = widgetInput.configuration ?? null;

    const editableProperties: Partial<FlatPageLayoutWidget> = {
      title: widgetInput.title,
      type: widgetInput.type,
      objectMetadataId: widgetInput.objectMetadataId ?? null,
      gridPosition: widgetInput.gridPosition,
      position: widgetInput.position ?? null,
      configuration,
      pageLayoutTabId: widgetInput.pageLayoutTabId,
    };

    if (widgetInput.conditionalDisplay !== undefined) {
      editableProperties.conditionalDisplay =
        widgetInput.conditionalDisplay ?? null;
    }

    if (widgetInput.conditionalAvailabilityExpression !== undefined) {
      editableProperties.conditionalAvailabilityExpression =
        widgetInput.conditionalAvailabilityExpression ?? null;
    }

    const { overrides, updatedEditableProperties } =
      sanitizeOverridableEntityInput({
        metadataName: 'pageLayoutWidget',
        existingFlatEntity: existingWidget,
        updatedEditableProperties: editableProperties,
        shouldOverride,
      });

    const updatedWidget: FlatPageLayoutWidget = {
      ...existingWidget,
      ...updatedEditableProperties,
      overrides,
      updatedAt: now.toISOString(),
    };

    if (updatedEditableProperties.pageLayoutTabId !== undefined) {
      const { pageLayoutTabUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'pageLayoutWidget',
          foreignKeyValues: {
            pageLayoutTabId: updatedWidget.pageLayoutTabId,
          },
          flatEntityMaps: { flatPageLayoutTabMaps },
        });

      updatedWidget.pageLayoutTabUniversalIdentifier =
        pageLayoutTabUniversalIdentifier;
    }

    if (updatedEditableProperties.objectMetadataId !== undefined) {
      const { objectMetadataUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'pageLayoutWidget',
          foreignKeyValues: {
            objectMetadataId: updatedWidget.objectMetadataId,
          },
          flatEntityMaps: { flatObjectMetadataMaps },
        });

      updatedWidget.objectMetadataUniversalIdentifier =
        objectMetadataUniversalIdentifier;
    }

    if (isDefined(overrides)) {
      updatedWidget.universalOverrides =
        fromPageLayoutWidgetOverridesToUniversalOverrides({
          overrides,
          pageLayoutTabUniversalIdentifierById:
            flatPageLayoutTabMaps.universalIdentifierById,
        });
    } else {
      updatedWidget.universalOverrides = null;
    }

    if (isDefined(configuration)) {
      updatedWidget.universalConfiguration =
        fromPageLayoutWidgetConfigurationToUniversalConfiguration({
          configuration,
          fieldMetadataUniversalIdentifierById:
            flatFieldMetadataMaps.universalIdentifierById,
          frontComponentUniversalIdentifierById:
            flatFrontComponentMaps.universalIdentifierById,
          viewFieldGroupUniversalIdentifierById:
            flatViewFieldGroupMaps.universalIdentifierById,
          viewUniversalIdentifierById: flatViewMaps.universalIdentifierById,
        });
    }

    return updatedWidget;
  }

  private findWidgetsInTabOrMovingToTab({
    tabId,
    widgetIdsInCurrentTabInput,
    flatPageLayoutWidgetMaps,
  }: {
    tabId: string;
    widgetIdsInCurrentTabInput: Set<string>;
    flatPageLayoutWidgetMaps: AllFlatEntityMaps['flatPageLayoutWidgetMaps'];
  }): FlatPageLayoutWidget[] {
    return Object.values(flatPageLayoutWidgetMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (widget) =>
          widget.pageLayoutTabId === tabId ||
          widgetIdsInCurrentTabInput.has(widget.id),
      );
  }

  private excludeWidgetsMovedToOtherTabs({
    idsToRemove,
    widgetIdsAcrossAllTabs,
  }: {
    idsToRemove: string[];
    widgetIdsAcrossAllTabs: Set<string>;
  }): string[] {
    return idsToRemove.filter(
      (widgetId) => !widgetIdsAcrossAllTabs.has(widgetId),
    );
  }

  private validateChartFieldReferences({
    widgetInput,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  }: {
    widgetInput: UpdatePageLayoutWidgetWithIdInput;
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
  }): void {
    if (!isDefined(widgetInput.configuration)) {
      return;
    }

    validateChartConfigurationFieldReferencesOrThrow({
      widgetConfiguration: widgetInput.configuration,
      widgetObjectMetadataId: widgetInput.objectMetadataId,
      widgetTitle: widgetInput.title,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    });
  }

  private collectOrphanedViewIdsFromRemovedWidgets({
    widgetsToCreate,
    widgetsToUpdate,
    widgetsToDelete,
    tabsToUpdate,
    tabsToDelete,
    flatPageLayoutWidgetMaps,
  }: {
    widgetsToCreate: FlatPageLayoutWidget[];
    widgetsToUpdate: FlatPageLayoutWidget[];
    widgetsToDelete: FlatPageLayoutWidget[];
    tabsToUpdate: FlatPageLayoutTab[];
    tabsToDelete: FlatPageLayoutTab[];
    flatPageLayoutWidgetMaps: Pick<
      AllFlatEntityMaps,
      'flatPageLayoutWidgetMaps'
    >['flatPageLayoutWidgetMaps'];
  }): string[] {
    const viewIdsToDelete = new Set<string>();
    const directlyRemovedWidgetIds = new Set<string>();

    for (const widget of widgetsToDelete) {
      directlyRemovedWidgetIds.add(widget.id);
      const viewId = this.getViewIdFromFieldsWidget(widget);

      if (isDefined(viewId)) {
        viewIdsToDelete.add(viewId);
      }
    }

    for (const widget of widgetsToUpdate) {
      if (!widget.isActive) {
        directlyRemovedWidgetIds.add(widget.id);
      }
    }

    const removedTabIds = new Set([
      ...tabsToUpdate.filter((tab) => !tab.isActive).map((tab) => tab.id),
      ...tabsToDelete.map((tab) => tab.id),
    ]);

    const allExistingWidgets = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    ).filter(isDefined);

    for (const widget of allExistingWidgets) {
      if (widget.isActive && removedTabIds.has(widget.pageLayoutTabId)) {
        const viewId = this.getViewIdFromFieldsWidget(widget);

        if (isDefined(viewId)) {
          viewIdsToDelete.add(viewId);
        }
      }
    }

    for (const widget of allExistingWidgets) {
      if (
        widget.isActive &&
        !directlyRemovedWidgetIds.has(widget.id) &&
        !removedTabIds.has(widget.pageLayoutTabId)
      ) {
        const viewId = this.getViewIdFromFieldsWidget(widget);

        if (isDefined(viewId)) {
          viewIdsToDelete.delete(viewId);
        }
      }
    }

    for (const widget of widgetsToCreate) {
      const viewId = this.getViewIdFromFieldsWidget(widget);

      if (isDefined(viewId)) {
        viewIdsToDelete.delete(viewId);
      }
    }

    return [...viewIdsToDelete];
  }

  private getViewIdFromFieldsWidget(
    widget: FlatPageLayoutWidget,
  ): string | undefined {
    if (
      widget.configuration.configurationType !== WidgetConfigurationType.FIELDS
    ) {
      return undefined;
    }

    const viewId = (widget.configuration as { viewId?: string | null }).viewId;

    return typeof viewId === 'string' ? viewId : undefined;
  }

  private async destroyOrphanedFieldsWidgetViews({
    viewIds,
    workspaceId,
  }: {
    viewIds: string[];
    workspaceId: string;
  }): Promise<void> {
    for (const viewId of viewIds) {
      try {
        await this.viewService.destroyOne({
          destroyViewInput: { id: viewId },
          workspaceId,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to destroy view ${viewId} after Fields widget deletion: ${error}`,
        );
      }
    }
  }
}
