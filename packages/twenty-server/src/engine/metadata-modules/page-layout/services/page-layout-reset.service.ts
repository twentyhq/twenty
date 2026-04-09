import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { splitEntitiesByResetStrategy } from 'src/engine/metadata-modules/flat-entity/utils/split-entities-by-reset-strategy.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
  PageLayoutTabExceptionMessageKey,
  generatePageLayoutTabExceptionMessage,
} from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { fromFlatPageLayoutTabToPageLayoutTabDto } from 'src/engine/metadata-modules/page-layout-tab/utils/from-flat-page-layout-tab-to-page-layout-tab-dto.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';
import { fromFlatPageLayoutWidgetToPageLayoutWidgetDto } from 'src/engine/metadata-modules/page-layout-widget/utils/from-flat-page-layout-widget-to-page-layout-widget-dto.util';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';

@Injectable()
export class PageLayoutResetService {
  private readonly logger = new Logger(PageLayoutResetService.name);

  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly dashboardSyncService: DashboardSyncService,
    private readonly viewService: ViewService,
  ) {}

  async resetPageLayoutWidgetToDefault({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<PageLayoutWidgetDTO> {
    const {
      flatPageLayoutWidgetMaps,
      flatViewFieldGroupMaps,
      flatViewFieldMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPageLayoutWidgetMaps',
            'flatViewFieldGroupMaps',
            'flatViewFieldMaps',
          ],
        },
      );

    const widget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });

    if (!isDefined(widget) || isDefined(widget.deletedAt)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    if (
      !isFlatPageLayoutWidgetConfigurationOfType(
        widget,
        WidgetConfigurationType.FIELDS,
      )
    ) {
      throw new PageLayoutWidgetException(
        `Widget "${id}" is not a FIELDS widget and cannot be reset to default`,
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      widget.applicationUniversalIdentifier ===
      workspaceCustomFlatApplication.universalIdentifier
    ) {
      throw new PageLayoutWidgetException(
        `Custom widget "${id}" cannot be reset to default`,
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    const now = new Date().toISOString();

    const widgetToUpdate: FlatPageLayoutWidget = {
      ...widget,
      overrides: null,
      updatedAt: now,
    };

    const viewId = widget.configuration.viewId;

    const {
      viewFieldGroupsToUpdate,
      viewFieldGroupsToDelete,
      viewFieldsToUpdate,
      viewFieldsToDelete,
    } = isDefined(viewId)
      ? this.computeFieldsWidgetChildResetOperations({
          viewId,
          flatViewFieldGroupMaps,
          flatViewFieldMaps,
          workspaceCustomApplicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          now,
        })
      : {
          viewFieldGroupsToUpdate: [],
          viewFieldGroupsToDelete: [],
          viewFieldsToUpdate: [],
          viewFieldsToDelete: [],
        };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [widgetToUpdate],
              flatEntityToDelete: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToUpdate: viewFieldGroupsToUpdate,
              flatEntityToDelete: viewFieldGroupsToDelete,
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToUpdate: viewFieldsToUpdate,
              flatEntityToDelete: viewFieldsToDelete,
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
        'Multiple validation errors occurred while resetting page layout widget to default',
      );
    }

    const { flatPageLayoutWidgetMaps: recomputedWidgetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    const updatedWidget = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedWidgetMaps,
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByWidgetId({
      widgetId: id,
      workspaceId,
      updatedAt: new Date(updatedWidget.updatedAt),
    });

    return fromFlatPageLayoutWidgetToPageLayoutWidgetDto(updatedWidget);
  }

  async resetPageLayoutTabToDefault({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<Omit<PageLayoutTabDTO, 'widgets'>> {
    const {
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
      flatViewFieldGroupMaps,
      flatViewFieldMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPageLayoutTabMaps',
            'flatPageLayoutWidgetMaps',
            'flatViewFieldGroupMaps',
            'flatViewFieldMaps',
          ],
        },
      );

    const tab = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatPageLayoutTabMaps,
    });

    if (!isDefined(tab) || isDefined(tab.deletedAt)) {
      throw new PageLayoutTabException(
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          id,
        ),
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      tab.applicationUniversalIdentifier ===
      workspaceCustomFlatApplication.universalIdentifier
    ) {
      throw new PageLayoutTabException(
        `Custom tab "${id}" cannot be reset to default`,
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    }

    const now = new Date().toISOString();

    const tabToUpdate: FlatPageLayoutTab = {
      ...tab,
      overrides: null,
      updatedAt: now,
    };

    const {
      widgetsToUpdate,
      widgetsToDelete,
      viewFieldGroupsToUpdate,
      viewFieldGroupsToDelete,
      viewFieldsToUpdate,
      viewFieldsToDelete,
      orphanedViewIds,
    } = this.computeTabChildResetOperations({
      tabId: id,
      flatPageLayoutWidgetMaps,
      flatViewFieldGroupMaps,
      flatViewFieldMaps,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      now,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [tabToUpdate],
              flatEntityToDelete: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToUpdate: widgetsToUpdate,
              flatEntityToDelete: widgetsToDelete,
            },
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToUpdate: viewFieldGroupsToUpdate,
              flatEntityToDelete: viewFieldGroupsToDelete,
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToUpdate: viewFieldsToUpdate,
              flatEntityToDelete: viewFieldsToDelete,
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
        'Multiple validation errors occurred while resetting page layout tab to default',
      );
    }

    await this.destroyOrphanedFieldsWidgetViews({
      viewIds: orphanedViewIds,
      workspaceId,
    });

    const { flatPageLayoutTabMaps: recomputedTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    const updatedTab = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedTabMaps,
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByTabId({
      tabId: id,
      workspaceId,
      updatedAt: new Date(updatedTab.updatedAt),
    });

    return fromFlatPageLayoutTabToPageLayoutTabDto(updatedTab);
  }

  private computeTabChildResetOperations({
    tabId,
    flatPageLayoutWidgetMaps,
    flatViewFieldGroupMaps,
    flatViewFieldMaps,
    workspaceCustomApplicationUniversalIdentifier,
    now,
  }: {
    tabId: string;
    flatPageLayoutWidgetMaps: {
      byUniversalIdentifier: Record<string, FlatPageLayoutWidget | undefined>;
    };
    flatViewFieldGroupMaps: {
      byUniversalIdentifier: Record<string, FlatViewFieldGroup | undefined>;
    };
    flatViewFieldMaps: {
      byUniversalIdentifier: Record<string, FlatViewField | undefined>;
    };
    workspaceCustomApplicationUniversalIdentifier: string;
    now: string;
  }): {
    widgetsToUpdate: FlatPageLayoutWidget[];
    widgetsToDelete: FlatPageLayoutWidget[];
    viewFieldGroupsToUpdate: FlatViewFieldGroup[];
    viewFieldGroupsToDelete: FlatViewFieldGroup[];
    viewFieldsToUpdate: FlatViewField[];
    viewFieldsToDelete: FlatViewField[];
    orphanedViewIds: string[];
  } {
    const existingWidgets = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (widget) =>
          widget.pageLayoutTabId === tabId && !isDefined(widget.deletedAt),
      );

    const { toHardDelete: widgetsToDelete, toReset: widgetsToReset } =
      splitEntitiesByResetStrategy({
        entities: existingWidgets,
        workspaceCustomApplicationUniversalIdentifier,
        now,
      });

    let allViewFieldGroupsToUpdate: FlatViewFieldGroup[] = [];
    let allViewFieldGroupsToDelete: FlatViewFieldGroup[] = [];
    let allViewFieldsToUpdate: FlatViewField[] = [];
    let allViewFieldsToDelete: FlatViewField[] = [];

    for (const widget of widgetsToReset) {
      if (
        !isFlatPageLayoutWidgetConfigurationOfType(
          widget,
          WidgetConfigurationType.FIELDS,
        )
      ) {
        continue;
      }

      const viewId = widget.configuration.viewId;

      if (!isDefined(viewId)) {
        continue;
      }

      const {
        viewFieldGroupsToUpdate,
        viewFieldGroupsToDelete,
        viewFieldsToUpdate,
        viewFieldsToDelete,
      } = this.computeFieldsWidgetChildResetOperations({
        viewId,
        flatViewFieldGroupMaps,
        flatViewFieldMaps,
        workspaceCustomApplicationUniversalIdentifier,
        now,
      });

      allViewFieldGroupsToUpdate = [
        ...allViewFieldGroupsToUpdate,
        ...viewFieldGroupsToUpdate,
      ];
      allViewFieldGroupsToDelete = [
        ...allViewFieldGroupsToDelete,
        ...viewFieldGroupsToDelete,
      ];
      allViewFieldsToUpdate = [...allViewFieldsToUpdate, ...viewFieldsToUpdate];
      allViewFieldsToDelete = [...allViewFieldsToDelete, ...viewFieldsToDelete];
    }

    const orphanedViewIds =
      this.collectOrphanedViewIdsFromDeletedWidgets(widgetsToDelete);

    return {
      widgetsToUpdate: widgetsToReset,
      widgetsToDelete,
      viewFieldGroupsToUpdate: allViewFieldGroupsToUpdate,
      viewFieldGroupsToDelete: allViewFieldGroupsToDelete,
      viewFieldsToUpdate: allViewFieldsToUpdate,
      viewFieldsToDelete: allViewFieldsToDelete,
      orphanedViewIds,
    };
  }

  private collectOrphanedViewIdsFromDeletedWidgets(
    widgets: FlatPageLayoutWidget[],
  ): string[] {
    const viewIds: string[] = [];

    for (const widget of widgets) {
      if (
        widget.configuration.configurationType !==
        WidgetConfigurationType.FIELDS
      ) {
        continue;
      }

      const viewId = (widget.configuration as { viewId?: string | null })
        .viewId;

      if (typeof viewId === 'string') {
        viewIds.push(viewId);
      }
    }

    return viewIds;
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
          `Failed to destroy orphaned view ${viewId} during tab reset: ${error}`,
        );
      }
    }
  }

  private computeFieldsWidgetChildResetOperations({
    viewId,
    flatViewFieldGroupMaps,
    flatViewFieldMaps,
    workspaceCustomApplicationUniversalIdentifier,
    now,
  }: {
    viewId: string;
    flatViewFieldGroupMaps: {
      byUniversalIdentifier: Record<string, FlatViewFieldGroup | undefined>;
    };
    flatViewFieldMaps: {
      byUniversalIdentifier: Record<string, FlatViewField | undefined>;
    };
    workspaceCustomApplicationUniversalIdentifier: string;
    now: string;
  }): {
    viewFieldGroupsToUpdate: FlatViewFieldGroup[];
    viewFieldGroupsToDelete: FlatViewFieldGroup[];
    viewFieldsToUpdate: FlatViewField[];
    viewFieldsToDelete: FlatViewField[];
  } {
    const existingGroups = Object.values(
      flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (group) => group.viewId === viewId && !isDefined(group.deletedAt),
      );

    const existingFields = Object.values(
      flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (field) => field.viewId === viewId && !isDefined(field.deletedAt),
      );

    const { toHardDelete: groupsToDelete, toReset: groupsToReset } =
      splitEntitiesByResetStrategy({
        entities: existingGroups,
        workspaceCustomApplicationUniversalIdentifier,
        now,
      });

    const { toHardDelete: fieldsToDelete, toReset: fieldsToReset } =
      splitEntitiesByResetStrategy({
        entities: existingFields,
        workspaceCustomApplicationUniversalIdentifier,
        now,
      });

    const viewFieldsToReset = fieldsToReset.map((field) => ({
      ...field,
      universalOverrides: null,
    }));

    return {
      viewFieldGroupsToUpdate: groupsToReset,
      viewFieldGroupsToDelete: groupsToDelete,
      viewFieldsToUpdate: viewFieldsToReset,
      viewFieldsToDelete: fieldsToDelete,
    };
  }
}
